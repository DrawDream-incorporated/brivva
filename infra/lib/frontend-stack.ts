import { Stack, StackProps, RemovalPolicy, Duration, CfnOutput, Fn } from 'aws-cdk-lib';
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
import { HostedZone, ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

export interface FrontendStackProps extends StackProps {
  domainName: string;
  hostedZoneName: string;
  certificateArn: string;
  backendPublicDnsName: string;
}

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const { domainName, hostedZoneName, certificateArn, backendPublicDnsName } = props;

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
          origin: new HttpOrigin(backendPublicDnsName, {
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
  }
}