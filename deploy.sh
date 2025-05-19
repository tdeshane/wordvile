#!/bin/bash

set -e

# Default values
DEPLOY_METHOD="sam"  # Default to SAM
REGION="us-east-1"
STACK_NAME="wordvile-backend"
S3_BUCKET="wordvile-words"
FRONTEND_BUCKET="wordvile-public"
SETUP_INFRA=true
DEPLOY_FRONTEND=true

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --method)
      DEPLOY_METHOD="$2"
      shift 2
      ;;
    --region)
      REGION="$2"
      shift 2
      ;;
    --stack-name)
      STACK_NAME="$2"
      shift 2
      ;;
    --s3-bucket)
      S3_BUCKET="$2"
      shift 2
      ;;
    --frontend-bucket)
      FRONTEND_BUCKET="$2"
      shift 2
      ;;
    --skip-infra)
      SETUP_INFRA=false
      shift
      ;;
    --skip-frontend)
      DEPLOY_FRONTEND=false
      shift
      ;;
    -h|--help)
      echo "Deploy WordVile application"
      echo ""
      echo "Usage: ./deploy.sh [options]"
      echo "Options:"
      echo "  --method [sam|serverless]  Deployment method (default: sam)"
      echo "  --region REGION          AWS region (default: us-east-1)"
      echo "  --stack-name NAME        CloudFormation stack name (default: wordvile-backend)"
      echo "  --s3-bucket BUCKET       S3 bucket for backend data (default: wordvile-words)"
      echo "  --frontend-bucket BUCKET S3 bucket for frontend (default: wordvile-public)"
      echo "  --skip-infra             Skip infrastructure setup (use existing resources)"
      echo "  --skip-frontend          Skip frontend deployment"
      echo "  -h, --help              Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

echo -e "${YELLOW}=== Starting WordVile Deployment ===${NC}"
echo "Deployment Method: $DEPLOY_METHOD"
echo "Region: $REGION"
echo "Stack Name: $STACK_NAME"
echo "Backend S3 Bucket: $S3_BUCKET"
echo "Frontend S3 Bucket: $FRONTEND_BUCKET"
echo "Setup Infrastructure: $SETUP_INFRA"
echo "Deploy Frontend: $DEPLOY_FRONTEND"

# Set TMPDIR to a user-writable directory
export TMPDIR=/home/toby/tmp
mkdir -p "$TMPDIR"
chmod 700 "$TMPDIR"

# Make all scripts executable
echo -e "\n${YELLOW}=== Setting up scripts ===${NC}"
chmod +x scripts/*.sh

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo -e "${RED}AWS CLI is not installed. Please install it first.${NC}"
  echo "Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
  exit 1
fi

# Check if user is authenticated with AWS
if ! aws sts get-caller-identity &> /dev/null; then
  echo -e "${RED}Not authenticated with AWS. Please run 'aws configure' first.${NC}"
  exit 1
fi

# Run infrastructure setup for backend
if [ "$SETUP_INFRA" = true ]; then
  echo -e "\n${YELLOW}=== Setting up backend infrastructure ===${NC}"
  ./scripts/setup-backend-infra.sh \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --s3-bucket "$S3_BUCKET"
    
  # Get the API URL from the CloudFormation output
  API_URL=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
    --output text 2>/dev/null || true)
    
  if [ -n "$API_URL" ]; then
    echo -e "\n${GREEN}Backend API URL: $API_URL${NC}"
  fi
else
  echo -e "\n${YELLOW}=== Skipping backend infrastructure setup (using existing) ===${NC}"
fi

# Setup frontend infrastructure
if [ "$DEPLOY_FRONTEND" = true ]; then
  echo -e "\n${YELLOW}=== Setting up frontend infrastructure ===${NC}"
  ./scripts/create_s3_and_cloudfront.sh --bucket "$FRONTEND_BUCKET" --region "$REGION"
  
  # Deploy frontend
  echo -e "\n${YELLOW}=== Deploying frontend ===${NC}"
  ./scripts/deploy-frontend.sh --bucket "$FRONTEND_BUCKET" --region "$REGION"
  
  # Get the CloudFront distribution URL
  DIST_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?contains(Origins.Items[0].DomainName, '${FRONTEND_BUCKET}.s3')].Id" \
    --output text)
    
  if [ -n "$DIST_ID" ]; then
    CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution --id "$DIST_ID" --query "Distribution.DomainName" --output text)
    FRONTEND_URL="https://$CLOUDFRONT_DOMAIN"
    
    echo -e "\n${GREEN}=== Frontend Deployment Complete ===${NC}"
    echo -e "${GREEN}Frontend URL: $FRONTEND_URL${NC}"
  else
    echo -e "\n${YELLOW}Warning: Could not find CloudFront distribution for the frontend.${NC}"
    echo -e "Frontend may not be accessible via CloudFront yet. Please check the AWS Console.${NC}"
  fi
else
  echo -e "\n${YELLOW}=== Skipping frontend deployment ===${NC}"
fi

# Get API Gateway URL if not already set
if [ -z "$API_URL" ] && [ "$SETUP_INFRA" = false ]; then
  API_URL=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
    --output text 2>/dev/null || true)
fi

# Display final information
echo -e "\n${GREEN}=== Deployment Summary ===${NC}"
if [ -n "$API_URL" ]; then
  echo -e "${GREEN}Backend API URL:${NC} $API_URL"
fi
if [ -n "$FRONTEND_URL" ]; then
  echo -e "${GREEN}Frontend URL:${NC} $FRONTEND_URL"
fi
echo -e "${GREEN}Backend S3 Bucket:${NC} $S3_BUCKET"
echo -e "${GREEN}Frontend S3 Bucket:${NC} $FRONTEND_BUCKET"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Test your API endpoints:"
echo "   curl -X GET '$API_URL/words/test'"
echo -e "\n2. If you need to make changes, you can update and redeploy:"
echo "   # Make your changes"
echo "   ./deploy.sh --skip-infra  # Skip infrastructure if not changed"
echo -e "\n3. To tear down the infrastructure, use the cleanup script:"
echo "   ./scripts/cleanup.sh --stack-name $STACK_NAME --region $REGION"

echo -e "${YELLOW}Note:${NC} It may take a few minutes for all changes to propagate globally."
