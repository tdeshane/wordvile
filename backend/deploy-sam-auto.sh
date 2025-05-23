#!/bin/bash
set -e
unset PAGER
unset AWS_PAGER

STACK_NAME=bible-word-game-backend
REGION=us-east-1

sam build
sam deploy \
  --stack-name $STACK_NAME \
  --capabilities CAPABILITY_IAM \
  --no-confirm-changeset \
  --no-fail-on-empty-changeset \
  --region $REGION \
  --resolve-s3

API_URL=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
  --output text)

echo "API Gateway endpoint: $API_URL" 