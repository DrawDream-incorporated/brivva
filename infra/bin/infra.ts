#!/usr/bin/env node
import 'source-map-support/register';
import 'dotenv/config';
import { App } from 'aws-cdk-lib';
import { BackendStack } from '../lib/backend-stack';
import { FrontendStack } from '../lib/frontend-stack';

const app = new App();

// Get API key from environment variable (required)
const livespeechApiKey = process.env.LIVESPEECH_API_KEY;
if (!livespeechApiKey) {
  throw new Error('LIVESPEECH_API_KEY environment variable is required. Set it via: export LIVESPEECH_API_KEY=your_key');
}

// Backend EC2 public DNS - set after first deployment, or leave empty for first run
// After deploying BrivvaBackendStack, get the EC2PublicDnsName output and set it here
const backendPublicDns = process.env.BACKEND_PUBLIC_DNS || '';

// Backend Stack in ap-northeast-2 (same region as LiveSpeech)
const backendStack = new BackendStack(app, 'BrivvaBackendStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-northeast-2', // Seoul region - same as LiveSpeech
  },
  livespeechApiKey,
  crossRegionReferences: true,
});

// Frontend Stack in us-east-1 (required for CloudFront ACM certificates)
// Note: Deploy BrivvaBackendStack first, then set BACKEND_PUBLIC_DNS and deploy this
if (backendPublicDns) {
  new FrontendStack(app, 'BrivvaFrontendStack', {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: 'us-east-1',
    },
    domainName: 'app-brivva.drawdream.ca',
    hostedZoneName: 'drawdream.ca',
    certificateArn: 'arn:aws:acm:us-east-1:' + process.env.CDK_DEFAULT_ACCOUNT + ':certificate/27cdeb71-22b2-44bf-9976-82ce42f85c64',
    backendPublicDnsName: backendPublicDns,
    crossRegionReferences: true,
  });
} else {
  console.log('');
  console.log('⚠️  BACKEND_PUBLIC_DNS not set.');
  console.log('   1. First, deploy the backend: npx cdk deploy BrivvaBackendStack');
  console.log('   2. Get the EC2PublicDnsName from the output');
  console.log('   3. Set BACKEND_PUBLIC_DNS=<value> in your .env file');
  console.log('   4. Then deploy the frontend: npx cdk deploy BrivvaFrontendStack');
  console.log('');
}