# Brivva Infrastructure (AWS CDK)

AWS CDK infrastructure for deploying Brivva to AWS.

## Architecture

```
[app-brivva.drawdream.ca]
         ↓
    [CloudFront]
      /       \
     /         \
  [S3]     [EC2 t4g.micro]
  React     Rust Backend
  Static    (WebSocket)
```

## Components

| Component | AWS Service | Cost Estimate |
|-----------|-------------|---------------|
| Frontend | S3 + CloudFront | ~$0.50/month |
| Backend | EC2 t4g.micro | ~$3/month |
| Domain | Route53 | $0.50/month |
| Secrets | Secrets Manager | ~$0.40/month |
| **Total** | | **~$4.50/month** |

## Prerequisites

1. **AWS CLI** configured with credentials
2. **Node.js 18+** and npm
3. **CDK CLI** installed: `npm install -g aws-cdk`
4. **CDK bootstrapped** in your account: `cdk bootstrap`

## Quick Start

### 1. Install Dependencies

```bash
cd infra
npm install
```

### 2. Update API Key in Secrets Manager

After deployment, update the secret with your actual LiveSpeech API key:

```bash
aws secretsmanager put-secret-value \
  --secret-id brivva/livespeech-api-key \
  --secret-string "YOUR_ACTUAL_API_KEY"
```

### 3. Deploy Infrastructure

```bash
npm run deploy
```

### 4. Build and Deploy Frontend

```bash
# Build the frontend
cd ../web
npm install
npm run build

# Upload to S3 (get bucket name from CDK output)
aws s3 sync dist/ s3://brivva-frontend-YOUR_ACCOUNT_ID/ --delete

# Invalidate CloudFront cache (get distribution ID from CDK output)
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

## CDK Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript |
| `npm run synth` | Synthesize CloudFormation template |
| `npm run deploy` | Deploy to AWS |
| `npm run destroy` | Destroy all resources |

## Outputs

After deployment, CDK will output:

- `WebsiteURL` - https://app-brivva.drawdream.ca
- `CloudFrontDistributionId` - For cache invalidation
- `S3BucketName` - For uploading frontend
- `EC2InstanceId` - For SSH/SSM access
- `EC2PublicIP` - For debugging
- `SecretArn` - For updating API key

## Updating the Backend

The EC2 instance clones from GitHub on startup. To update:

### Option 1: Redeploy EC2 (cleanest)

```bash
# Force EC2 replacement
aws ec2 terminate-instances --instance-ids YOUR_INSTANCE_ID
# CDK will create a new one on next deploy
npm run deploy
```

### Option 2: SSH and Pull (fastest)

```bash
# SSH into instance (if you set keyName)
ssh -i your-key.pem ec2-user@EC2_PUBLIC_IP

# Or use SSM Session Manager
aws ssm start-session --target YOUR_INSTANCE_ID

# Then pull and rebuild
cd /opt/brivva/repo
git pull
cd dataplane
cargo build --release
sudo systemctl restart brivva
```

## Configuration

### Domain Name

Edit `bin/infra.ts`:

```typescript
domainName: 'your-domain.example.com',
hostedZoneName: 'example.com',
certificateArn: 'arn:aws:acm:us-east-1:...',
```

### SSH Access

To enable SSH access, update `lib/brivva-stack.ts`:

```typescript
keyName: 'your-key-pair-name', // Line ~172
```

### Instance Type

To change instance type:

```typescript
instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.SMALL),
```

## Troubleshooting

### Check EC2 User Data Logs

```bash
# Via SSM
aws ssm start-session --target YOUR_INSTANCE_ID

# Then check logs
sudo cat /var/log/cloud-init-output.log
sudo cat /var/log/brivva-setup.log
journalctl -u brivva -f
```

### WebSocket Connection Issues

1. Check EC2 security group allows port 8080
2. Check CloudFront origin is correctly configured
3. Check the backend is running: `systemctl status brivva`

### Frontend Not Loading

1. Check S3 bucket has files
2. Check CloudFront distribution is deployed
3. Try invalidating cache: `aws cloudfront create-invalidation ...`

## Cost Optimization

For even lower costs:

1. **Use Spot Instance**: ~60% cheaper but can be interrupted
2. **Turn off when not using**: Stop EC2 at night
3. **Use CloudFront caching**: Reduce S3 requests

## Clean Up

To destroy all resources:

```bash
npm run destroy
```

⚠️ This will delete:
- EC2 instance
- S3 bucket (and all contents)
- CloudFront distribution
- Route53 record
- Secrets Manager secret