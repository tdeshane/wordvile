#!/bin/bash
set -e

if command -v sam &> /dev/null; then
  echo "AWS SAM CLI is already installed."
  sam --version
  exit 0
fi

if [[ "$OSTYPE" == "darwin"* ]]; then
  if ! command -v brew &> /dev/null; then
    echo "Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
  echo "Installing AWS SAM CLI with Homebrew..."
  brew install aws/tap/aws-sam-cli
else
  echo "Please install the AWS SAM CLI manually for your OS:"
  echo "https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
  exit 1
fi

sam --version 