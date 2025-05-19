#!/bin/bash

set -e
unset PAGER
unset AWS_PAGER

# Default values
BUCKET="wordvile-public"
REGION="us-east-1"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --bucket)
      BUCKET="$2"
      shift 2
      ;;
    --region)
      REGION="$2"
      shift 2
      ;;
    -h|--help)
      echo "Set up S3 bucket and CloudFront distribution for WordVile frontend"
      echo ""
      echo "Usage: $0 [options]"
      echo "Options:"
      echo "  --bucket BUCKET   S3 bucket name (default: wordvile-public)"
      echo "  --region REGION   AWS region (default: us-east-1)"
      echo "  -h, --help       Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

echo -e "${YELLOW}=== Setting up S3 and CloudFront ===${NC}"
echo "S3 Bucket: $BUCKET"
echo "Region: $REGION"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  echo -e "${YELLOW}jq is not installed. Installing...${NC}"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install jq
  else
    sudo apt-get update && sudo apt-get install -y jq
  fi
fi

# Create bucket with correct region handling
echo -e "\n${YELLOW}=== Creating S3 bucket: $BUCKET in $REGION ===${NC}"
if [ "$REGION" = "us-east-1" ]; then
  aws s3api create-bucket --bucket "$BUCKET" --region "$REGION" || true
else
  aws s3api create-bucket --bucket "$BUCKET" --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION" || true
fi

# Wait for bucket to exist
echo "Waiting for bucket to exist..."
aws s3api wait bucket-exists --bucket "$BUCKET"

echo -e "\n${YELLOW}=== Configuring S3 bucket ===${NC}"

# Disable Block Public Access
echo "Disabling Block Public Access..."
aws s3api put-public-access-block \
  --bucket "$BUCKET" \
  --public-access-block-configuration '
    BlockPublicAcls=false,
    IgnorePublicAcls=false,
    BlockPublicPolicy=false,
    RestrictPublicBuckets=false'

# Enable static website hosting
echo "Enabling static website hosting..."
aws s3 website "s3://$BUCKET/" \
  --index-document index.html \
  --error-document index.html

# Set bucket policy
echo "Setting bucket policy..."
POLICY=$(cat <<-EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::$BUCKET",
        "arn:aws:s3:::$BUCKET/*"
      ]
    }
  ]
}
EOF
)

echo "$POLICY" > /tmp/bucket-policy.json
aws s3api put-bucket-policy --bucket "$BUCKET" --policy file:///tmp/bucket-policy.json
rm /tmp/bucket-policy.json

S3_WEBSITE_ENDPOINT="${BUCKET}.s3-website-${REGION}.amazonaws.com"
echo -e "\n${GREEN}S3 Website Endpoint: http://$S3_WEBSITE_ENDPOINT${NC}"

# Check if CloudFront distribution already exists
echo -e "\n${YELLOW}=== Checking for existing CloudFront distribution ===${NC}"
EXISTING_DIST=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?contains(Origins.Items[0].DomainName, '${BUCKET}.s3')].Id" \
  --output text)

if [ -n "$EXISTING_DIST" ]; then
  echo -e "${YELLOW}Found existing CloudFront distribution: $EXISTING_DIST${NC}"
  DISTRIBUTION_ID="$EXISTING_DIST"
  
  # Get the domain name
  DISTRIBUTION_DOMAIN=$(aws cloudfront get-distribution --id "$DISTRIBUTION_ID" \
    --query "Distribution.DomainName" --output text)
  
  echo -e "${GREEN}Using existing CloudFront distribution: $DISTRIBUTION_DOMAIN${NC}"
else
  # Create CloudFront distribution
  echo -e "\n${YELLOW}=== Creating CloudFront distribution ===${NC}"
  
  CLOUDFRONT_CONFIG=$(cat <<-EOF
  {
    "CallerReference": "wordvile-$(date +%s)",
    "Comment": "WordVile Frontend",
    "Enabled": true,
    "Origins": {
      "Quantity": 1,
      "Items": [
        {
          "Id": "S3-${BUCKET}",
          "DomainName": "${S3_WEBSITE_ENDPOINT}",
          "OriginPath": "",
          "CustomOriginConfig": {
            "HTTPPort": 80,
            "HTTPSPort": 443,
            "OriginProtocolPolicy": "http-only",
            "OriginSslProtocols": {
              "Quantity": 1,
              "Items": ["TLSv1.2"]
            },
            "OriginReadTimeout": 30,
            "OriginKeepaliveTimeout": 5
          }
        }
      ]
    },
    "DefaultCacheBehavior": {
      "TargetOriginId": "S3-${BUCKET}",
      "ViewerProtocolPolicy": "redirect-to-https",
      "AllowedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"],
        "CachedMethods": {
          "Quantity": 2,
          "Items": ["GET", "HEAD"]
        }
      },
      "Compress": true,
      "ForwardedValues": {
        "QueryString": false,
        "Cookies": {
          "Forward": "none"
        },
        "Headers": {
          "Quantity": 0
        },
        "QueryStringCacheKeys": {
          "Quantity": 0
        }
      },
      "DefaultTTL": 86400,
      "MinTTL": 0,
      "MaxTTL": 31536000
    },
    "ViewerCertificate": {
      "CloudFrontDefaultCertificate": true,
      "MinimumProtocolVersion": "TLSv1.2_2021"
    },
    "DefaultRootObject": "index.html",
    "HttpVersion": "http2",
    "IsIPV6Enabled": true
  }
  EOF
  )
  
  echo "$CLOUDFRONT_CONFIG" > /tmp/cloudfront-config.json
  
  echo "Creating CloudFront distribution..."
  DISTRIBUTION_JSON=$(aws cloudfront create-distribution \
    --distribution-config file:///tmp/cloudfront-config.json)
  
  DISTRIBUTION_ID=$(echo "$DISTRIBUTION_JSON" | jq -r '.Distribution.Id')
  DISTRIBUTION_DOMAIN=$(echo "$DISTRIBUTION_JSON" | jq -r '.Distribution.DomainName')
  
  rm /tmp/cloudfront-config.json
  
  echo -e "\n${GREEN}CloudFront Distribution Created${NC}"
  echo "Distribution ID: $DISTRIBUTION_ID"
  echo "Domain Name: $DISTRIBUTION_DOMAIN"
fi

# Update the deploy-frontend.sh script with the distribution ID
if [ -f "scripts/deploy-frontend.sh" ]; then
  echo -e "\n${YELLOW}=== Updating deploy-frontend.sh with Distribution ID ===${NC}"
  sed -i.bak "s/DISTRIBUTION_ID=\"[^\"]*\"/DISTRIBUTION_ID=\"$DISTRIBUTION_ID\"/" scripts/deploy-frontend.sh
  rm -f scripts/deploy-frontend.sh.bak 2>/dev/null || true
  echo "Updated deploy-frontend.sh with Distribution ID: $DISTRIBUTION_ID"
fi

echo -e "\n${GREEN}=== Setup Complete ===${NC}"
echo -e "${GREEN}1. S3 bucket configured:${NC} $BUCKET"
echo -e "${GREEN}2. CloudFront distribution:${NC} $DISTRIBUTION_ID"
echo -e "${GREEN}3. Website URL:${NC}          https://$DISTRIBUTION_DOMAIN"

echo -e "${YELLOW}Next steps:${NC}"
echo "1. Deploy the frontend files to the S3 bucket:"
echo "   ./scripts/deploy-frontend.sh"
echo -e "\n2. The CloudFront distribution may take 5-10 minutes to be fully deployed."
echo "   You can check the status in the AWS CloudFront console."

echo -e "${YELLOW}Note:${NC} If you're using a custom domain, you'll need to:"
echo "1. Create a certificate in AWS Certificate Manager"
echo "2. Update the CloudFront distribution to use the certificate"
echo "3. Set up a Route 53 record or CNAME to point to the CloudFront distribution"
