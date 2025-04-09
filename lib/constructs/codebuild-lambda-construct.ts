import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { envValues } from '../../config/types';

interface LambdaCodeBuildConstructProps {
  repository: codecommit.IRepository;
  envValues: envValues
}

export class LambdaCodeBuildConstruct extends Construct {
  public readonly lambdaBuildProject: codebuild.Project;
  public readonly lambdaZipBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: LambdaCodeBuildConstructProps) {
    super(scope, id);

    // Create S3 bucket for storing Lambda zip files
    this.lambdaZipBucket = new s3.Bucket(this, `LambdaZipBucket${props.envValues.envNameStack}`, {
      bucketName: `tci-${props.envValues.envName}-address-correction-function-zip`,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Create CodeBuild Project for Lambda deployment
    this.lambdaBuildProject = new codebuild.Project(this, `LambdaBuildProject${props.envValues.envNameStack}`, {
      projectName: `tci-${props.envValues.envName}-mecab-lambda-codebuild-project`,
      source: codebuild.Source.codeCommit({
        repository: props.repository,
        branchOrRef: props.envValues.branchName,
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
        environmentVariables: {
          LAMBDA_FUNCTION_NAME: { value: `tci-${props.envValues.envName}-address-correction-function` },
          ENV: { value: "dev" },
          // REPO_NAME: { value: props.repository.repositoryName },
          S3_BUCKET_NAME: { value: this.lambdaZipBucket.bucketName },
        },
      },
      buildSpec: codebuild.BuildSpec.fromSourceFilename('cicd/lambda_buildspec.yml'),
    });

    // Add a bucket policy to allow access from the CodeBuild role
    this.lambdaZipBucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject', 's3:PutObject'],
      resources: [`${this.lambdaZipBucket.bucketArn}/*`],
      principals: [new iam.ArnPrincipal(this.lambdaBuildProject.role?.roleArn || '')],
    }));

    // Add IAM policy to allow updating Lambda function code and aliases
    this.lambdaBuildProject.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'lambda:UpdateFunctionCode',
        'lambda:PublishVersion',
        'lambda:UpdateAlias',
        'lambda:GetAlias',
        'lambda:CreateAlias',
        'lambda:GetFunctionConfiguration',
        'codecommit:GetCommit',
        's3:PutObject',
        's3:GetObject',
      ],
      resources: [
        `arn:aws:lambda:ap-northeast-1:588907989152:function:tci-${props.envValues.envName}-address-correction-function`,
        `arn:aws:codecommit:ap-northeast-1:588907989152:${props.repository.repositoryName}`,
        `arn:aws:s3:::${this.lambdaZipBucket.bucketName}/*`,
      ],
    }));
  }
} 