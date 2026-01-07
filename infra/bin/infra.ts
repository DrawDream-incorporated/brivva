#!/usr/bin/env node
import 'source-map-support/register';
import 'dotenv/config';
import { App } from 'aws-cdk-lib';
import { BrivvaStack } from '../lib/brivva-stack';

const app = new App();

// Get API key from environment variable (required)
const livespeechApiKey = process.env.LIVESPEECH_API_KEY;
if (!livespeechApiKey) {
  throw new Error('LIVESPEECH_API_KEY environment variable is required. Set it via: export LIVESPEECH_API_KEY=your_key');
}

new BrivvaStack(app, 'BrivvaStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1', // Required for CloudFront ACM certificates
  },
  domainName: 'app-brivva.drawdream.ca',
  hostedZoneName: 'drawdream.ca',
  certificateArn: 'arn:aws:acm:us-east-1:' + process.env.CDK_DEFAULT_ACCOUNT + ':certificate/27cdeb71-22b2-44bf-9976-82ce42f85c64',
  livespeechApiKey,
});
