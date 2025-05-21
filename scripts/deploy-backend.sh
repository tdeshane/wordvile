#!/bin/bash

set -e
unset PAGER
unset AWS_PAGER

# Default values
DEPLOY_METHOD="sam"  # Default to SAM
STACK_NAME="wordvile-backend"
REGION="us-east-1"
S3_BUCKET="wordvile-words"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --method)
      DEPLOY_METHOD="$2"
      shift 2
      ;;
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
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Change to the backend directory
echo "\n=== Changing to backend directory ==="
cd "$(dirname "$0")/../backend"

# Install dependencies
echo "\n=== Installing dependencies ==="
npm install

# Create S3 bucket if it doesn't exist
echo "\\n=== Checking S3 bucket: $S3_BUCKET ==="
if ! aws s3 ls "s3://$S3_BUCKET" 2>&1 | grep -q \'NoSuchBucket\'; then
  echo "Creating S3 bucket: $S3_BUCKET"
  if [ "$REGION" = "us-east-1" ]; then
    aws s3api create-bucket --bucket "$S3_BUCKET" --region "$REGION"
  else
    aws s3api create-bucket --bucket "$S3_BUCKET" --region "$REGION" \\
      --create-bucket-configuration LocationConstraint="$REGION"
  fi
  
  # Set bucket policy
  cat <<-EOF > /tmp/bucket-policy.json
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
  aws s3api put-bucket-policy --bucket "$S3_BUCKET" --policy file:///tmp/bucket-policy.json
  rm /tmp/bucket-policy.json
  
  # Create initial data directory structure and upload default files from backend/data
  echo "Uploading default data files from ../data to S3 bucket $S3_BUCKET..."
  # Corrected path assuming script is in wordvile/scripts and cd's to wordvile/backend
  DEFAULT_DATA_SOURCE_DIR="./data" 
  
  if [ -d "$DEFAULT_DATA_SOURCE_DIR" ]; then
    for file_path in "$DEFAULT_DATA_SOURCE_DIR"/*; do
      if [ -f "$file_path" ]; then
        file_name=$(basename "$file_path")
        echo "Uploading $file_name to s3://$S3_BUCKET/$file_name"
        aws s3 cp "$file_path" "s3://$S3_BUCKET/$file_name"
      fi
    done
  else
    echo "Warning: Default data directory $DEFAULT_DATA_SOURCE_DIR not found. Uploading minimal fallback files."
    # Fallback: ensure at least silver.json and a generic words.json exist
    echo "Uploading minimal silver.json and words.json"
    echo '{ "name": "Silver", "title": "Princess of Wordvile", "state": "corrupted", "appearance": { "eyes": "purple", "aura": "dangerous purple mist", "form": "ethereal, floating" }, "description": "A powerful being corrupted by Menchuba.", "dialogue": { "corrupted": ["I feel... a pull towards darkness."], "redeemed": ["The light feels... good."] }, "emeraldsCollected": 0, "corruptionLevel": 100 }' > /tmp/default_silver.json
    aws s3 cp /tmp/default_silver.json "s3://$S3_BUCKET/silver.json"
    rm /tmp/default_silver.json

    echo "[]" > /tmp/default_words.json
    aws s3 cp /tmp/default_words.json "s3://$S3_BUCKET/words.json" # For any generic "words" game
    rm /tmp/default_words.json
  fi
  # rm -rf /tmp/wordvile-data # This line might be from old logic, can be removed if /tmp/wordvile-data is no longer used here.
else
  echo "S3 bucket $S3_BUCKET already exists"
fi

# Deploy using selected method
if [ "$DEPLOY_METHOD" = "sam" ]; then
  echo "\n=== Deploying with AWS SAM ==="
  
  # Check if SAM CLI is installed
  if ! command -v sam &> /dev/null; then
    echo "AWS SAM CLI is not installed. Installing..."
    ./setup-sam.sh || {
      echo "Failed to install AWS SAM CLI. Please install it manually."
      exit 1
    }
  fi
  
  # Update template with correct bucket name - NO LONGER NEEDED as template uses Parameter
  # sed -i.bak "s/bible-word-game-words/$S3_BUCKET/g" template.yaml
  
  # Build and deploy
  sam build
  sam deploy \
    --stack-name "$STACK_NAME" \
    --capabilities CAPABILITY_IAM \
    --no-confirm-changeset \
    --no-fail-on-empty-changeset \
    --region "$REGION" \
    --resolve-s3
    
  # Get API endpoint
  API_URL=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
    --output text)
    
  echo "\n=== Backend deployed successfully ==="
  echo "API Gateway endpoint: $API_URL"
  
  # Update frontend .env with the new API URL
  FRONTEND_ENV="../frontend/.env"
  if [ -f "$FRONTEND_ENV" ]; then
    sed -i.bak "/^REACT_APP_API_URL=/d" "$FRONTEND_ENV"
    echo "REACT_APP_API_URL=$API_URL" >> "$FRONTEND_ENV"
    echo "\nUpdated frontend .env with new API URL"
  fi
  
elif [ "$DEPLOY_METHOD" = "serverless" ]; then
  echo "\n=== Deploying with Serverless Framework ==="
  
  if ! command -v serverless &> /dev/null; then
    echo "Serverless Framework is not installed. Installing..."
    npm install -g serverless
  fi
  
  # Update serverless.yml with correct bucket name
  sed -i.bak "s/bible-word-game-words/$S3_BUCKET/g" serverless.yml
  
  # Deploy
  serverless deploy --region "$REGION" --stage prod
  
  echo "\n=== Backend deployed successfully with Serverless Framework ==="
  
else
  echo "Invalid deployment method: $DEPLOY_METHOD"
  echo "Please use 'sam' or 'serverless'"
  exit 1
fi

echo "\n=== Backend deployment complete ==="
echo "S3 Bucket: $S3_BUCKET"
echo "Stack Name: $STACK_NAME"
echo "Region: $REGION"
