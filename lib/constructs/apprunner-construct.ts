import * as apprunner from '@aws-cdk/aws-apprunner-alpha';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { envValues } from '../../config/types';

interface AppRunnerConstructProps {
  envValues: envValues;
}

export class AppRunnerConstruct extends Construct {
  constructor(scope: Construct, id: string, props: AppRunnerConstructProps) {
    super(scope, id);

    // Retrieve the ECR repository name from Parameter Store
    const ecrRepoName = ssm.StringParameter.fromStringParameterName(
      this,
      `AppRunnerEcrRepoNameParameter${props.envValues.envNameStack}`,
      `/app-runner/${props.envValues.envName}/ecr-repo-name`
    ).stringValue;
    // const ecrRepoName = 'tci-dev-mecab-main-web'

    const appRunnerContainerRepo = ecr.Repository.fromRepositoryName(this, `AppRunnerEcrRepo${props.envValues.envNameStack}`, ecrRepoName)

    const service = new apprunner.Service(this, `AppRunnerService${props.envValues.envNameStack}`, {
      serviceName: `tci-${props.envValues.envName}-mecab-app-runner-service`,
      source: apprunner.Source.fromEcr({
        imageConfiguration: {
          port: 8000,
          environmentVariables: {
            'PORT': '8000',
          },
        },
        repository: appRunnerContainerRepo,
        tagOrDigest: 'latest',
      }),
    });

    // Store the App Runner service URL in Parameter Store
    new ssm.StringParameter(this, `AppRunnerServiceUrlParameter${props.envValues.envNameStack}`, {
      parameterName: `/app-runner/${props.envValues.envName}/service-url`,
      stringValue: service.serviceUrl,
    });

    // Add IAM policy to allow storing values in the SSM parameter
    // service.node.addDependency(new iam.PolicyStatement({
    //   actions: ['ssm:PutParameter'],
    //   resources: [
    //     `arn:aws:ssm:${Stack.of(this).region}:${Stack.of(this).account}:parameter/app-runner/${props.constants.ENV_NAME}/service-url`,
    //     `arn:aws:ssm:${Stack.of(this).region}:${Stack.of(this).account}:parameter/app-runner/${props.constants.ENV_NAME}/ecr-repo-name`
    //   ],
    // }));
  }
} 