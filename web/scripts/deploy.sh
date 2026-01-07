#!/bin/bash
set -e

# Build the app
echo "Building web app..."
npm run build

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET_NAME="brivva-frontend-${ACCOUNT_ID}"

# Get CloudFront distribution ID from CDK outputs
echo "Getting CloudFront distribution ID..."
DISTRIBUTION_ID=$(aws cloudformation describe-stacks --stack-name BrivvaStack --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" --output text --region us-east-1)

if [ -z "$DISTRIBUTION_ID" ]; then
    echo "Error: Could not get CloudFront distribution ID. Make sure CDK stack is deployed."
    exit 1
fi

echo "Bucket: $BUCKET_NAME"
echo "Distribution: $DISTRIBUTION_ID"

# Sync to S3
echo "Syncing to S3..."
aws s3 sync dist/ s3://${BUCKET_NAME}/ --delete --region us-east-1

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths "/*" --region us-east-1

echo "Deploy complete!"