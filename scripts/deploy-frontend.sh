#!/bin/bash

set -e
unset PAGER
unset AWS_PAGER

# Default values
BUCKET="wordvile-public"
DISTRIBUTION_ID=""  # Will be set automatically if not provided
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
    --distribution-id)
      DISTRIBUTION_ID="$2"
      shift 2
      ;;
    --region)
      REGION="$2"
      shift 2
      ;;
    -h|--help)
      echo "Deploy WordVile frontend to S3 and CloudFront"
      echo ""
      echo "Usage: $0 [options]"
      echo "Options:"
      echo "  --bucket BUCKET       S3 bucket name (default: wordvile-public)"
      echo "  --distribution-id ID  CloudFront distribution ID (will be auto-detected if not provided)"
      echo "  --region REGION       AWS region (default: us-east-1)"
      echo "  -h, --help           Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

echo -e "${YELLOW}=== Starting frontend deployment ===${NC}"
echo "S3 Bucket: $BUCKET"
echo "Region: $REGION"

# Change to the frontend directory
echo -e "\n${YELLOW}=== Changing to frontend directory ===${NC}"
cd "$(dirname "$0")/../frontend"

# Install dependencies
echo -e "\n${YELLOW}=== Installing dependencies ===${NC}"
if [ -f "yarn.lock" ]; then
  yarn install --frozen-lockfile
else
  npm ci
fi

# Build the application
echo -e "\n${YELLOW}=== Building React app ===${NC}"
if [ -f "yarn.lock" ]; then
  yarn build
else
  npm run build
fi

# Determine build directory
BUILD_DIR="build"
if [ ! -d "$BUILD_DIR" ]; then
  BUILD_DIR="dist"
fi

if [ ! -d "$BUILD_DIR" ]; then
  echo -e "${YELLOW}Build directory not found in $BUILD_DIR!${NC}" >&2
  exit 1
fi

# Sync to S3
echo -e "\n${YELLOW}=== Syncing to S3 bucket: $BUCKET ===${NC}"
aws s3 sync "$BUILD_DIR/" "s3://$BUCKET/" --delete --acl public-read \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "asset-manifest.json"

# Upload HTML files with different cache settings
echo -e "\n${YELLOW}=== Uploading HTML files with proper cache headers ===${NC}"
aws s3 cp "$BUILD_DIR/index.html" "s3://$BUCKET/index.html" --content-type "text/html" \
  --cache-control "public, max-age=0, must-revalidate" --acl public-read

# Get the CloudFront distribution ID if not provided
if [ -z "$DISTRIBUTION_ID" ]; then
  echo -e "\n${YELLOW}=== Getting CloudFront distribution ID ===${NC}"
  DISTRIBUTION_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?contains(Origins.Items[0].DomainName, '${BUCKET}.s3')].Id" \
    --output text 2>/dev/null || true)
  
  if [ -z "$DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}No CloudFront distribution found for bucket $BUCKET${NC}"
    echo -e "${YELLOW}Please run create_s3_and_cloudfront.sh first or provide --distribution-id${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Found CloudFront distribution ID: $DISTRIBUTION_ID${NC}"
fi

# Invalidate CloudFront cache
echo -e "\n${YELLOW}=== Invalidating CloudFront distribution: $DISTRIBUTION_ID ===${NC}"
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

echo -e "${GREEN}Invalidation started with ID: $INVALIDATION_ID${NC}"

# Get the CloudFront domain name
CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution --id "$DISTRIBUTION_ID" \
  --query "Distribution.DomainName" --output text)
CLOUDFRONT_URL="https://$CLOUDFRONT_DOMAIN"

# Check the deployment
echo -e "\n${YELLOW}=== Checking deployment at: $CLOUDFRONT_URL ===${NC}"
if command -v http &> /dev/null; then
  http --headers "$CLOUDFRONT_URL" | head -n 20
else
  curl -I "$CLOUDFRONT_URL" | head -n 20
fi

echo -e "\n${GREEN}=== Deployment Complete ===${NC}"
echo -e "${GREEN}Frontend URL: $CLOUDFRONT_URL${NC}"
echo -e "${GREEN}CloudFront Distribution ID: $DISTRIBUTION_ID${NC}"
echo -e "${GREEN}S3 Bucket: $BUCKET${NC}"

echo -e "${YELLOW}Note:${NC} It may take a few minutes for the CloudFront changes to propagate globally."
