import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as assets from 'aws-cdk-lib/aws-ecr-assets';
import * as apprunner from '@aws-cdk/aws-apprunner-alpha';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import { AppRunnerConstruct } from '../constructs/app-runner-construct';
import { CodeBuildConstruct } from '../constructs/codebuild-construct';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class MasterDevMecabMainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Reference the existing ECR repository for pushing
    const repository = ecr.Repository.fromRepositoryName(
      this,
      'ExistingEcrRepo',
      'tci-dev-mecab-main-web'
    );

    // Reference the existing CodeCommit repository
    const codeCommitRepo = codecommit.Repository.fromRepositoryName(
      this,
      'ExistingCodeCommitRepo',
      'master-dev-mecab-main'
    );

    // Define the base image repository name
    const baseImageRepositoryName = 'mecab-base-image';

    // const asset = new assets.DockerImageAsset(this, 'ImageAssets', {
    //   directory: './app',
    //   platform: assets.Platform.LINUX_AMD64
    // });

    new AppRunnerConstruct(this, 'AppRunnerConstruct', { repository });

    // Create CodeBuild Construct
    const codeBuildConstruct = new CodeBuildConstruct(this, 'CodeBuildConstruct', { 
      codeCommitRepo, 
      repository, // Pass the ECR repository here
      baseImageRepositoryName // Pass the base image repository name
    });

    // Create CodePipeline
    const pipeline = new codepipeline.Pipeline(this, 'MyPipeline', {
      pipelineName: 'tci-dev-mecab-main',
      restartExecutionOnUpdate: true,
    });

    // Source Stage
    const sourceOutput = new codepipeline.Artifact();
    const sourceAction = new codepipeline_actions.CodeCommitSourceAction({
      actionName: 'CodeCommit',
      repository: codeCommitRepo,
      branch: 'develop', // Specify the branch you want to use
      output: sourceOutput,
    });

    // Build Stage
    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'Build',
      project: codeBuildConstruct.codeBuildProject, // Reference the CodeBuild project
      input: sourceOutput,
      outputs: [new codepipeline.Artifact()], // Optional: specify output artifacts
    });

    // Add stages to the pipeline
    pipeline.addStage({
      stageName: 'Source',
      actions: [sourceAction],
    });

    pipeline.addStage({
      stageName: 'Build',
      actions: [buildAction],
    });

    // Grant permissions to CodeBuild to push to the existing ECR repository
    repository.grantPullPush(codeBuildConstruct.codeBuildProject);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'AppQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
