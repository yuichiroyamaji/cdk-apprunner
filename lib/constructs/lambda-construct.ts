import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { envValues } from '../../config/types';

interface LambdaConstructProps {
  envValues: envValues,
}

export class LambdaConstruct extends Construct {
  public readonly lambdaFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    // Retrieve the App Runner service URL from Parameter Store
    const appRunnerServiceUrl = ssm.StringParameter.fromStringParameterName(
      this,
      `AppRunnerServiceUrlParameter${props.envValues.envNameStack}`,
      `/app-runner/${props.envValues.envName}/service-url`
    ).stringValue;

    // Define the Lambda layer
    const requestsLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'RequestsLayer', 'arn:aws:lambda:ap-northeast-1:770693421928:layer:Klayers-p312-requests:10');

    this.lambdaFunction = new lambda.Function(this, 'LambdaFunction', {
      functionName: 'tci-dev-address-correction-function',
      runtime: lambda.Runtime.PYTHON_3_12,
      code: lambda.Code.fromAsset('src/lambda'),
      handler: 'hello_world.lambda_handler',
      environment: {
        MECAB_API_URL: `https://${appRunnerServiceUrl}?address=`,
        FORCE_UPDATE: 'true', // Fake variable just to trigger the lambda function update. Erase next time
      },
      layers: [requestsLayer], // Add the layer to the Lambda function
    });

    // Add IAM policy to allow accessing the SSM parameter
    // this.lambdaFunction.addToRolePolicy(new iam.PolicyStatement({
    //   actions: ['ssm:GetParameter'],
    //   resources: [
    //     `arn:aws:ssm:${Stack.of(this).region}:${Stack.of(this).account}:parameter/app-runner/${props.envValues.envName}/service-url`
    //   ],
    // }));
  }
} 