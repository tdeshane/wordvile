#!/bin/bash

set -e

# Default values
DEPLOY_METHOD="sam"
REGION="us-east-1"
STACK_NAME="wordvile-backend"
S3_BUCKET="wordvile-words" # Backend data bucket
FRONTEND_BUCKET="wordvile-public" # Frontend S3 bucket

SETUP_INFRA=false # Default: Do not run full infrastructure setup
DEPLOY_BACKEND=true # Default: Deploy backend
DEPLOY_FRONTEND=true # Default: Deploy frontend

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
    --s3-bucket) # For backend
      S3_BUCKET="$2"
      shift 2
      ;;
    --frontend-bucket) # For frontend
      FRONTEND_BUCKET="$2"
      shift 2
      ;;
    --setup-infra) # New flag to enable full infra setup
      SETUP_INFRA=true
      shift
      ;;
    --skip-infra) # Kept for clarity, ensures SETUP_INFRA is false
      SETUP_INFRA=false
      shift
      ;;
    --skip-backend) # New flag to skip backend deployment
      DEPLOY_BACKEND=false
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
      echo "Default behavior (no options): Deploys backend and frontend code changes."
      echo ""
      echo "Options:"
      echo "  --method [sam|serverless]  Backend deployment method (default: sam)"
      echo "  --region REGION          AWS region (default: us-east-1)"
      echo "  --stack-name NAME        Backend CloudFormation stack name (default: wordvile-backend)"
      echo "  --s3-bucket BUCKET       S3 bucket for backend data (default: wordvile-words)"
      echo "  --frontend-bucket BUCKET S3 bucket for frontend hosting (default: wordvile-public)"
      echo "  --setup-infra            Run full infrastructure setup for backend and frontend (e.g., S3, CloudFront, API Gateway, Lambda stack)"
      echo "  --skip-infra             Explicitly skip full infrastructure setup (this is the default)"
      echo "  --skip-backend           Skip backend deployment"
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
echo "Run Full Infrastructure Setup: $SETUP_INFRA"
echo "Deploy Backend: $DEPLOY_BACKEND"
echo "Deploy Frontend: $DEPLOY_FRONTEND"

# Set TMPDIR to a user-writable directory
export TMPDIR=/home/toby/tmp
mkdir -p "$TMPDIR"
chmod 700 "$TMPDIR"

echo -e "\n${GREEN}=== Setting up scripts ===${NC}"
# Determine script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
SCRIPTS_SUB_DIR="$SCRIPT_DIR/scripts"

chmod +x "$SCRIPTS_SUB_DIR"/*.sh # Corrected chmod path

# Navigate to the backend directory for backend deployment
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Ensure environment variables are available to sub-scripts
export REGION STACK_NAME S3_BUCKET FRONTEND_BUCKET DEPLOY_METHOD SETUP_INFRA

# Step 1: Setup Backend Infrastructure (if --setup-infra is true)
if [ "$SETUP_INFRA" = true ] && [ "$DEPLOY_BACKEND" = true ]; then
    echo -e "\n${GREEN}=== Setting up Backend Infrastructure ===${NC}"
    if [ "$DEPLOY_METHOD" = "sam" ]; then
        # SAM specific infrastructure setup (e.g., S3 bucket for SAM artifacts if not already handled by sam deploy)
        # This might involve running a specific script or CloudFormation template
        echo "Running SAM infrastructure setup..."
        # Example: aws cloudformation deploy --template-file some-infra-template.yaml --stack-name ${STACK_NAME}-infra --capabilities CAPABILITY_IAM
        # For now, we assume 'sam deploy' handles bucket creation or it's pre-existing.
        # The S3_BUCKET for words is created/checked in deploy-backend.sh
        echo "SAM infrastructure setup for backend S3 bucket ($S3_BUCKET) will be handled by deploy-backend.sh or assumed pre-existing."
    elif [ "$DEPLOY_METHOD" = "serverless" ]; then
        echo "Serverless Framework infrastructure setup for backend..."
        # Serverless might handle its own S3 resources or require specific commands.
        # cd "$BACKEND_DIR"
        # serverless deploy --stage dev # Example
        # cd "$SCRIPT_DIR"
        echo "Serverless infrastructure setup for backend S3 bucket ($S3_BUCKET) will be handled by deploy-backend.sh or assumed pre-existing."
    else
        echo -e "${RED}Unsupported backend deployment method: $DEPLOY_METHOD${NC}"
        exit 1
    fi
elif [ "$SETUP_INFRA" = true ] && [ "$DEPLOY_BACKEND" = false ]; then
    echo -e "\n${YELLOW}=== Skipping Backend Infrastructure Setup (backend deployment skipped) ===${NC}"
fi

# Step 2: Deploy Backend Code (if not skipped)
if [ "$DEPLOY_BACKEND" = true ]; then
    echo -e "\n${GREEN}=== Deploying Backend Code ===${NC}"
    "$SCRIPTS_SUB_DIR/deploy-backend.sh" # Pass all relevant variables as env vars
else
    echo -e "\n${YELLOW}=== Skipping Backend Deployment ===${NC}"
fi

# Step 3: Setup Frontend Infrastructure (if --setup-infra is true)
# This includes S3 bucket for static hosting and CloudFront distribution
if [ "$SETUP_INFRA" = true ] && [ "$DEPLOY_FRONTEND" = true ]; then
    echo -e "\n${GREEN}=== Setting up Frontend Infrastructure (S3 and CloudFront) ===${NC}"
    # Call the script to create S3 bucket and CloudFront distribution
    # Pass FRONTEND_BUCKET and REGION as arguments or environment variables
    "$SCRIPTS_SUB_DIR/create_s3_and_cloudfront.sh" "$FRONTEND_BUCKET" "$REGION"
    # Note: create_s3_and_cloudfront.sh should output the CloudFront distribution domain
    # to a known location or environment variable if needed by deploy-frontend.sh
elif [ "$SETUP_INFRA" = true ] && [ "$DEPLOY_FRONTEND" = false ]; then
    echo -e "\n${YELLOW}=== Skipping Frontend Infrastructure Setup (frontend deployment skipped) ===${NC}"
fi

# Step 4: Build and Deploy Frontend (if not skipped)
if [ "$DEPLOY_FRONTEND" = true ]; then
    echo -e "\n${GREEN}=== Building and Deploying Frontend ===${NC}"
    # The deploy-frontend.sh script will handle building the React app
    # and syncing it to the S3 bucket.
    # It needs FRONTEND_BUCKET and potentially the CloudFront Distribution ID for invalidation.
    "$SCRIPTS_SUB_DIR/deploy-frontend.sh" # Pass all relevant variables as env vars

    # Output CloudFront URL if available (this might need to be fetched or passed from create_s3_and_cloudfront.sh)
    # For now, constructing a probable S3 website URL or reminding user to check CloudFront console.
    echo -e "${GREEN}Frontend deployed. Check your S3 bucket static website hosting URL or CloudFront distribution.${NC}"
    # Example S3 URL (replace with actual if bucket is configured for website hosting):
    # echo "Likely S3 Website URL: http://${FRONTEND_BUCKET}.s3-website-${REGION}.amazonaws.com"
else
    echo -e "\n${YELLOW}=== Skipping Frontend Deployment ===${NC}"
fi


echo -e "\n${GREEN}=== WordVile Deployment Process Finished ===${NC}"

# Clean up TMPDIR
if [ -d "$TMPDIR" ]; then
    echo -e "\n${GREEN}Cleaning up temporary directory: $TMPDIR${NC}"
    rm -rf "$TMPDIR"
fi
