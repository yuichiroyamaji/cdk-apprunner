import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as assets from 'aws-cdk-lib/aws-ecr-assets';
import * as apprunner from '@aws-cdk/aws-apprunner-alpha';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const asset = new assets.DockerImageAsset(this, 'ImageAssets', {
       directory: './app/mecab',
       platform: assets.Platform.LINUX_AMD64
    });

    new apprunner.Service(this, 'AppRunner', {
      source: apprunner.Source.fromAsset({
        imageConfiguration: {
          port: 8000,
          environment: {
            'PORT': '8000'
          }
        },
        asset: asset
      })
    });

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'AppQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
