import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { Construct } from 'constructs';
import { AppRunnerCodeBuildConstruct } from './codebuild-apprunner-construct';
import { LambdaCodeBuildConstruct } from './codebuild-lambda-construct';
import { Env } from '../../config/constants_type';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { projectInfo, envValues } from '../../config/types';

interface PipelineConstructProps {
  envValues: envValues,
  projectInfo: projectInfo
}

export class PipelineConstruct extends Construct {
  constructor(scope: Construct, id: string, props: PipelineConstructProps) {
    super(scope, id);

    // Create a new ECR repository
    const appRunnerContainerRepo = new ecr.Repository(this, `AppRunnerEcrRepo${props.envValues.envNameStack}-${id}-unique`, {
      repositoryName: `tci-${props.envValues.envName}-mecab-app-runner-repo`,
    });

    // Store the ECR repository name in Parameter Store
    new ssm.StringParameter(this, `AppRunnerEcrRepoNameParameter${props.envValues.envNameStack}`, {
      parameterName: `/app-runner/${props.envValues.envName}/ecr-repo-name`,
      stringValue: appRunnerContainerRepo.repositoryName,
    });

    // Reference the existing CodeCommit repository
    const thisProjectCodeCommitRepo = codecommit.Repository.fromRepositoryName(
      this,
      'ExistingCodeCommitRepo',
      props.projectInfo.projectRepoName
    );

    // Create CodePipeline
    const pipeline = new codepipeline.Pipeline(this, `Pipeline${props.envValues.envNameStack}`, {
      pipelineName: `tci-dev-mecab-pipeline-${props.envValues.envName}`,
      restartExecutionOnUpdate: true,
    });

    // Source Stage
    const sourceOutput = new codepipeline.Artifact();
    const sourceAction = new codepipeline_actions.CodeCommitSourceAction({
      actionName: 'CodeCommit',
      repository: thisProjectCodeCommitRepo,
      branch: props.envValues.branchName,
      output: sourceOutput,
    });

    // Add stages to the pipeline
    pipeline.addStage({
      stageName: 'Source',
      actions: [sourceAction],
    });

    // Use the CodeBuild construct for AppRunner container
    const appRunnercodeBuildConstruct = new AppRunnerCodeBuildConstruct(this, `CodeBuildConstruct${props.envValues.envNameStack}`, {
      appRunnerContainerRepo: appRunnerContainerRepo,
      projectInfo: props.projectInfo,
      envValues: props.envValues
    });

    // AppRunner Container Build Stage
    const appRunnerBuildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'BuildAppRunnerContainer',
      project: appRunnercodeBuildConstruct.codeBuildProject,
      input: sourceOutput,
      outputs: [new codepipeline.Artifact()],
    });

    pipeline.addStage({
      stageName: 'AppRunnerBuild',
      actions: [appRunnerBuildAction],
    });

    // Create Lambda CodeBuild Construct
    const lambdaCodeBuildConstruct = new LambdaCodeBuildConstruct(this, `LambdaCodeBuildConstruct${props.envValues.envNameStack}`, {
      repository: thisProjectCodeCommitRepo,
      envValues: props.envValues
    });

    // Lambda Build Stage
    const lambdaBuildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'BuildLambda',
      project: lambdaCodeBuildConstruct.lambdaBuildProject,
      input: sourceOutput,
    });

    pipeline.addStage({
      stageName: 'LambdaBuild',
      actions: [lambdaBuildAction],
    });

    // Grant permissions to CodeBuild to push to the existing ECR repository
    // ecr.Repository.fromRepositoryName(this, `AppRunnerEcrRepo${props.constants.ENV_NAME}`, ecrRepoName).grantPullPush(appRunnercodeBuildConstruct.codeBuildProject);
  }
} 