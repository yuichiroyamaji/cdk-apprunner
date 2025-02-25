import * as apprunner from '@aws-cdk/aws-apprunner-alpha';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

interface AppRunnerConstructProps {
  repository: ecr.IRepository;
}

export class AppRunnerConstruct extends Construct {
  constructor(scope: Construct, id: string, props: AppRunnerConstructProps) {
    super(scope, id);

    new apprunner.Service(this, 'AppRunner', {
      source: apprunner.Source.fromEcr({
        imageConfiguration: {
          port: 8000,
          environment: {
            'PORT': '8000',
          },
        },
        repository: props.repository,
        tag: 'latest',
      }),
    });
  }
} 