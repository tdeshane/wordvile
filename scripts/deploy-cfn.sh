#!/bin/bash

set -e

# Default values
STACK_NAME="wordvile-backend"
REGION="us-east-1"
S3_BUCKET="wordvile-words"
ADMIN_TOKEN=$(openssl rand -hex 16)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --stack-name)
      STACK_NAME="$2"
      shift 2
      ;;
    --region)
      REGION="$2"
      shift 2
      ;;
    --s3-bucket)
      S3_BUCKET="$2"
      shift 2
      ;;
    --admin-token)
      ADMIN_TOKEN="$2"
      shift 2
      ;;
    -h|--help)
      echo "Deploy WordVile backend with AWS CloudFormation"
      echo ""
      echo "Usage: $0 [options]"
      echo "Options:"
      echo "  --stack-name NAME   CloudFormation stack name (default: wordvile-backend)"
      echo "  --region REGION     AWS region (default: us-east-1)"
      echo "  --s3-bucket BUCKET  S3 bucket for word data (default: wordvile-words)"
      echo "  --admin-token TOKEN Admin token for API access (default: auto-generated)"
      echo "  -h, --help         Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

echo -e "${YELLOW}=== Deploying WordVile Backend with CloudFormation ===${NC}"
echo "Stack Name: $STACK_NAME"
echo "Region: $REGION"
echo "S3 Bucket: $S3_BUCKET"
echo -e "Admin Token: ${GREEN}${ADMIN_TOKEN}${NC} (save this securely!)"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo -e "${RED}AWS CLI is not installed. Please install it first.${NC}"
  exit 1
fi

# Check if template file exists
TEMPLATE_FILE="$(dirname "$0")/../backend/template-cfn.yaml"
if [ ! -f "$TEMPLATE_FILE" ]; then
  echo -e "${RED}Error: template-cfn.yaml not found at $TEMPLATE_FILE${NC}"
  exit 1
fi

# Create S3 bucket if it doesn't exist
echo -e "\n${YELLOW}=== Checking S3 bucket: $S3_BUCKET ===${NC}"
if ! aws s3 ls "s3://$S3_BUCKET" 2>&1 | grep -q 'NoSuchBucket'; then
  echo "S3 bucket $S3_BUCKET already exists"
else
  echo "Creating S3 bucket: $S3_BUCKET"
  if [ "$REGION" = "us-east-1" ]; then
    aws s3api create-bucket --bucket "$S3_BUCKET" --region "$REGION"
  else
    aws s3api create-bucket --bucket "$S3_BUCKET" --region "$REGION" \
      --create-bucket-configuration LocationConstraint="$REGION"
  fi
  
  # Wait for bucket to exist
  echo "Waiting for bucket to be created..."
  aws s3api wait bucket-exists --bucket "$S3_BUCKET"
  
  # Create initial data file
  echo "Creating initial data structure..."
  mkdir -p /tmp/wordvile-data
  echo "[]" > /tmp/wordvile-data/words.json
  aws s3 cp /tmp/wordvile-data/words.json "s3://$S3_BUCKET/"
  rm -rf /tmp/wordvile-data
fi

# Deploy the CloudFormation stack
echo -e "\n${YELLOW}=== Deploying CloudFormation stack ===${NC}"
aws cloudformation deploy \
  --template-file "$TEMPLATE_FILE" \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
      AdminToken="$ADMIN_TOKEN" \
      S3BucketName="$S3_BUCKET"

# Get the API Gateway URL
API_URL=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
  --output text 2>/dev/null || true)

# Update frontend .env with the new API URL
FRONTEND_ENV="$(dirname "$0")/../frontend/.env"
if [ -f "$FRONTEND_ENV" ]; then
  echo -e "\n${YELLOW}=== Updating frontend environment variables ===${NC}"
  # Remove existing API URL if it exists
  sed -i.bak "/^REACT_APP_API_URL=/d" "$FRONTEND_ENV"
  # Add the new API URL
  echo "REACT_APP_API_URL=$API_URL" >> "$FRONTEND_ENV"
  echo -e "${GREEN}Updated frontend .env with API URL: $API_URL${NC}"
  
  # Remove backup file if it was created
  rm -f "${FRONTEND_ENV}.bak" 2>/dev/null || true
fi

echo -e "\n${GREEN}=== Deployment Complete ===${NC}"
echo -e "${GREEN}API Gateway URL:${NC} $API_URL"
echo -e "${GREEN}Admin Token:${NC} $ADMIN_TOKEN (save this securely!)"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Deploy the frontend:"
echo "   ./scripts/deploy-frontend.sh"
echo -e "\n2. Test the API endpoints:"
echo "   curl -X GET '$API_URL/words/test'"
echo "   curl -X POST -H \"Content-Type: application/json\" -H \"X-Admin-Token: $ADMIN_TOKEN\" -d '{\"word\":\"test\",\"definition\":\"A test word\"}' '$API_URL/words'"

echo -e "\n${YELLOW}Note:${NC} The API Gateway may take a few minutes to be fully deployed and propagate globally."
