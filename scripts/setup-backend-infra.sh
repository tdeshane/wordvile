#!/bin/bash

set -e
unset PAGER
unset AWS_PAGER

# Default values
STACK_NAME="wordvile-backend"
REGION="us-east-1"
S3_BUCKET="wordvile-words"
ADMIN_TOKEN=$(openssl rand -hex 16)  # Generate a random admin token

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
      echo "Set up WordVile backend infrastructure"
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

echo -e "${YELLOW}=== Setting up WordVile Backend Infrastructure ===${NC}"
echo "Stack Name: $STACK_NAME"
echo "Region: $REGION"
echo "S3 Bucket: $S3_BUCKET"
echo -e "Admin Token: ${GREEN}${ADMIN_TOKEN}${NC} (save this securely!)"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo -e "${RED}AWS CLI is not installed. Please install it first.${NC}"
  exit 1
fi

# Check if SAM CLI is installed
if ! command -v sam &> /dev/null; then
  echo -e "${YELLOW}SAM CLI is not installed. Installing...${NC}"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install aws-sam-cli
  else
    pip install --user aws-sam-cli
    export PATH=$PATH:$HOME/.local/bin
  fi
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
  
  # Set bucket policy
  echo "Setting bucket policy..."
  POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::$S3_BUCKET",
        "arn:aws:s3:::$S3_BUCKET/*"
      ]
    }
  ]
}
EOF
  )
  
  echo "$POLICY" > /tmp/bucket-policy.json
  aws s3api put-bucket-policy --bucket "$S3_BUCKET" --policy file:///tmp/bucket-policy.json
  rm /tmp/bucket-policy.json
  
  # Create initial data directory structure
  echo "Creating initial data structure..."
  mkdir -p /tmp/wordvile-data
  echo "[]" > /tmp/wordvile-data/words.json
  aws s3 cp /tmp/wordvile-data/words.json "s3://$S3_BUCKET/"
  rm -rf /tmp/wordvile-data
fi

# Update template with actual values
echo -e "\n${YELLOW}=== Preparing SAM template ===${NC}"
TEMP_TEMPLATE="/tmp/wordvile-template-$(date +%s).yaml"

# Change to the backend directory
BACKEND_DIR="$(dirname "$0")/../backend"
cd "$BACKEND_DIR" || { echo -e "${RED}Failed to change to backend directory${NC}"; exit 1; }

# Create a copy of the template with the correct bucket name
if [ ! -f "template.yaml" ]; then
  echo -e "${RED}Error: template.yaml not found in $BACKEND_DIR${NC}"
  exit 1
fi

sed "s/bible-word-game-words/$S3_BUCKET/g" "template.yaml" > "$TEMP_TEMPLATE"

# Deploy the backend using SAM
echo -e "\n${YELLOW}=== Deploying backend with SAM ===${NC}"

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
  echo "Installing Node.js dependencies..."
  npm install
fi

# Build the SAM application
echo "Building SAM application..."
sam build --template-file "$TEMP_TEMPLATE"

# Deploy the application
echo "Deploying SAM application..."
sam deploy \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --capabilities CAPABILITY_IAM \
  --no-confirm-changeset \
  --no-fail-on-empty-changeset \
  --resolve-s3 \
  --parameter-overrides \
      ParameterKey=AdminToken,ParameterValue="$ADMIN_TOKEN" \
      ParameterKey=S3BucketName,ParameterValue="$S3_BUCKET"

# Get the API Gateway URL
API_URL=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
  --output text)

# Update frontend .env with the new API URL
FRONTEND_ENV="../frontend/.env"
if [ -f "$FRONTEND_ENV" ]; then
  echo -e "\n${YELLOW}=== Updating frontend environment variables ===${NC}"
  # Remove existing API URL if it exists
  sed -i.bak "/^REACT_APP_API_URL=/d" "$FRONTEND_ENV"
  # Add the new API URL
  echo "REACT_APP_API_URL=$API_URL" >> "$FRONTEND_ENV"
  echo -e "${GREEN}Updated frontend .env with API URL: $API_URL${NC}
"
  
  # Remove backup file if it was created
  rm -f "${FRONTEND_ENV}.bak" 2>/dev/null || true
fi

# Clean up
echo -e "\n${YELLOW}=== Cleaning up ===${NC}"
rm -f "$TEMP_TEMPLATE"

echo -e "\n${GREEN}=== Backend Infrastructure Setup Complete ===${NC}"
echo -e "${GREEN}API Gateway URL:${NC} $API_URL"
echo -e "${GREEN}S3 Bucket:${NC} $S3_BUCKET"
echo -e "${GREEN}Admin Token:${NC} $ADMIN_TOKEN (save this securely!)"

echo -e "${YELLOW}Next steps:${NC}"
echo "1. Deploy the frontend:"
echo "   ./scripts/deploy-frontend.sh"
echo -e "\n2. Test the API endpoints:"
echo "   curl -X GET '$API_URL/words/test'"
echo "   curl -X POST -H \"Content-Type: application/json\" -H \"X-Admin-Token: $ADMIN_TOKEN\" -d '{\"key\":\"value\"}' '$API_URL/words/test'"

echo -e "\n${YELLOW}Note:${NC} The CloudFront distribution may take a few minutes to be fully deployed and propagate globally."
