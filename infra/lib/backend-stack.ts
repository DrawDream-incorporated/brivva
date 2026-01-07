import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
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
import { Construct } from 'constructs';

export interface BackendStackProps extends StackProps {
  livespeechApiKey: string;
}

export class BackendStack extends Stack {
  public readonly ec2PublicDnsName: string;
  public readonly ec2InstanceId: string;

  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    const { livespeechApiKey } = props;

    // ===================
    // VPC
    // ===================
    const vpc = new Vpc(this, 'BrivvaVpc', {
      maxAzs: 2,
      natGateways: 0,
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

    ec2SecurityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(8080),
      'Allow WebSocket from CloudFront'
    );

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
      '# Install AWS CLI',
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
      '# Add 2GB swap (t4g.micro only has 1GB RAM)',
      'fallocate -l 2G /swapfile',
      'chmod 600 /swapfile',
      'mkswap /swapfile',
      'swapon /swapfile',
      'echo "/swapfile swap swap defaults 0 0" >> /etc/fstab',
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
      '/root/.cargo/bin/cargo build --release -j 1',
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

    this.ec2PublicDnsName = ec2Instance.instancePublicDnsName;
    this.ec2InstanceId = ec2Instance.instanceId;

    // ===================
    // Outputs
    // ===================
    new CfnOutput(this, 'EC2InstanceId', {
      value: ec2Instance.instanceId,
      description: 'EC2 Instance ID',
      exportName: 'BrivvaBackendInstanceId',
    });

    new CfnOutput(this, 'EC2PublicDnsName', {
      value: ec2Instance.instancePublicDnsName,
      description: 'EC2 Public DNS Name',
      exportName: 'BrivvaBackendPublicDns',
    });

    new CfnOutput(this, 'EC2PublicIP', {
      value: ec2Instance.instancePublicIp,
      description: 'EC2 Public IP',
    });
  }
}