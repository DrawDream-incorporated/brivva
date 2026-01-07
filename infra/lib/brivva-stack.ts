import { Stack, StackProps, RemovalPolicy, Duration, CfnOutput } from 'aws-cdk-lib';
import { Bucket, BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import { 
  Distribution, 
  ViewerProtocolPolicy, 
  CachePolicy, 
  OriginProtocolPolicy, 
  OriginRequestPolicy, 
  AllowedMethods 
} from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin, HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { 
  Vpc, 
  SubnetType, 
  SecurityGroup, 
  Peer, 
  Port, 
  Instance, 
  InstanceType, 
  InstanceClass, 
  InstanceSize, 
  MachineImage, 
  AmazonLinuxCpuType, 
  UserData 
} from 'aws-cdk-lib/aws-ec2';
import { Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import { HostedZone, ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

export interface BrivvaStackProps extends StackProps {
  domainName: string;
  hostedZoneName: string;
  certificateArn: string;
  livespeechApiKey: string;
}

export class BrivvaStack extends Stack {
  constructor(scope: Construct, id: string, props: BrivvaStackProps) {
    super(scope, id, props);

    const { domainName, hostedZoneName, certificateArn, livespeechApiKey } = props;

    // ===================
    // VPC
    // ===================
    const vpc = new Vpc(this, 'BrivvaVpc', {
      maxAzs: 2,
      natGateways: 0, // Save cost - no NAT gateway needed
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: SubnetType.PUBLIC,
        },
      ],
    });

    // ===================
    // Security Group
    // ===================
    const ec2SecurityGroup = new SecurityGroup(this, 'Ec2SecurityGroup', {
      vpc,
      description: 'Security group for Brivva backend',
      allowAllOutbound: true,
    });

    // Allow HTTP from CloudFront (WebSocket upgrade)
    ec2SecurityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(8080),
      'Allow WebSocket from CloudFront'
    );

    // Allow SSH for debugging (optional - remove in production)
    ec2SecurityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(22),
      'Allow SSH'
    );

    // ===================
    // IAM Role for EC2
    // ===================
    const ec2Role = new Role(this, 'Ec2Role', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });

    // ===================
    // EC2 Instance (t4g.micro - ARM)
    // ===================
    const userData = UserData.forLinux();
    userData.addCommands(
      '#!/bin/bash',
      'set -e',
      '',
      '# Update system',
      'yum update -y',
      '',
      '# Install Docker',
      'amazon-linux-extras install docker -y || yum install docker -y',
      'systemctl start docker',
      'systemctl enable docker',
      'usermod -a -G docker ec2-user',
      '',
      '# Install AWS CLI (should be pre-installed on AL2)',
      'yum install -y aws-cli jq',
      '',
      '# API key passed from CDK',
      `API_KEY="${livespeechApiKey}"`,
      '',
      '# Create directory for the app',
      'mkdir -p /opt/brivva',
      'cd /opt/brivva',
      '',
      '# Create .env file',
      'echo "LIVESPEECH_API_KEY=$API_KEY" > .env',
      '',
      '# Pull and run the Docker container',
      '# Note: You need to push your image to ECR first, or build locally',
      '# For now, we will build from source',
      '',
      '# Install Rust and build tools',
      'curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y',
      'export PATH="/root/.cargo/bin:$PATH"',
      'yum groupinstall -y "Development Tools"',
      'yum install -y openssl-devel pkg-config',
      '',
      '# Clone and build the application',
      'yum install -y git',
      'git clone https://github.com/DrawDream-incorporated/brivva.git /opt/brivva/repo',
      'cd /opt/brivva/repo/dataplane',
      'cp /opt/brivva/.env .',
      '/root/.cargo/bin/cargo build --release',
      '',
      '# Create systemd service',
      'cat > /etc/systemd/system/brivva.service << EOF',
      '[Unit]',
      'Description=Brivva Dataplane Service',
      'After=network.target',
      '',
      '[Service]',
      'Type=simple',
      'User=root',
      'WorkingDirectory=/opt/brivva/repo/dataplane',
      'EnvironmentFile=/opt/brivva/repo/dataplane/.env',
      'ExecStart=/opt/brivva/repo/dataplane/target/release/brivva-dataplane',
      'Restart=always',
      'RestartSec=5',
      '',
      '[Install]',
      'WantedBy=multi-user.target',
      'EOF',
      '',
      '# Start the service',
      'systemctl daemon-reload',
      'systemctl enable brivva',
      'systemctl start brivva',
      '',
      '# Log completion',
      'echo "Brivva setup complete" > /var/log/brivva-setup.log'
    );

    const ec2Instance = new Instance(this, 'BrivvaBackend', {
      vpc,
      vpcSubnets: { subnetType: SubnetType.PUBLIC },
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MICRO),
      machineImage: MachineImage.latestAmazonLinux2023({
        cpuType: AmazonLinuxCpuType.ARM_64,
      }),
      securityGroup: ec2SecurityGroup,
      role: ec2Role,
      userData,
    });

    // ===================
    // S3 Bucket for Frontend
    // ===================
    const websiteBucket = new Bucket(this, 'WebsiteBucket', {
      bucketName: `brivva-frontend-${this.account}`,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });


    // ===================
    // Import ACM Certificate
    // ===================
    const certificate = Certificate.fromCertificateArn(
      this,
      'Certificate',
      certificateArn
    );

    // ===================
    // CloudFront Distribution
    // ===================
    const distribution = new Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(websiteBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        '/ws': {
          origin: new HttpOrigin(ec2Instance.instancePublicDnsName, {
            protocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
            httpPort: 8080,
          }),
          viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
          cachePolicy: CachePolicy.CACHING_DISABLED,
          originRequestPolicy: OriginRequestPolicy.ALL_VIEWER,
          allowedMethods: AllowedMethods.ALLOW_ALL,
        },
      },
      domainNames: [domainName],
      certificate,
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.minutes(0),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.minutes(0),
        },
      ],
    });

    // ===================
    // Route53 A Record
    // ===================
    const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName: hostedZoneName,
    });

    new ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      recordName: domainName,
      target: RecordTarget.fromAlias(
        new CloudFrontTarget(distribution)
      ),
    });

    // ===================
    // Outputs
    // ===================
    new CfnOutput(this, 'WebsiteURL', {
      value: `https://${domainName}`,
      description: 'Website URL',
    });

    new CfnOutput(this, 'CloudFrontDistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront Distribution ID',
    });

    new CfnOutput(this, 'S3BucketName', {
      value: websiteBucket.bucketName,
      description: 'S3 Bucket for frontend',
    });

    new CfnOutput(this, 'EC2InstanceId', {
      value: ec2Instance.instanceId,
      description: 'EC2 Instance ID',
    });

    new CfnOutput(this, 'EC2PublicIP', {
      value: ec2Instance.instancePublicIp,
      description: 'EC2 Public IP',
    });

  }
}
