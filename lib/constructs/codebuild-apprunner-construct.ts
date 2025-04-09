import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';
import { projectInfo, envValues } from '../../config/types';

interface AppRunnerCodeBuildConstructProps {
  appRunnerContainerRepo: ecr.IRepository;
  projectInfo: projectInfo,
  envValues: envValues
}

export class AppRunnerCodeBuildConstruct extends Construct {
  public readonly codeBuildProject: codebuild.IProject;

  constructor(scope: Construct, id: string, props: AppRunnerCodeBuildConstructProps) {
    super(scope, id);

    // Reference the existing CodeCommit repository
    const thisProjectCodeCommitRepo = codecommit.Repository.fromRepositoryName(
      this,
      'ExistingCodeCommitRepo',
      props.projectInfo.projectRepoName
    );

    const mecabBaseImageEcrRepoName = props.projectInfo.projectMecabRepoName;

    // Create CodeBuild Project
    this.codeBuildProject = new codebuild.Project(this, `AppRunnerBuildProject${props.envValues.envNameStack}`, {
      projectName: `tci-${props.envValues.envName}-mecab-apprunner-codebuild-project`,
      source: codebuild.Source.codeCommit({
        repository: thisProjectCodeCommitRepo,
        branchOrRef: `${props.envValues.branchName}`
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
        privileged: true,
        environmentVariables: {
          repositoryUri: { value: `${props.appRunnerContainerRepo.repositoryUri}` },
          baseImageRepositoryUri: { value: `${props.appRunnerContainerRepo.repositoryUri}/${mecabBaseImageEcrRepoName}` },
        },
      },
      buildSpec: codebuild.BuildSpec.fromSourceFilename('cicd/apprunner_buildspec.yml'),
    });

    // Add IAM policy for accessing SSM parameters
    const parameterStorePolicy = new iam.PolicyStatement({
      actions: [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath"
      ],
      resources: [
        `arn:aws:ssm:${Stack.of(this).region}:${Stack.of(this).account}:parameter/cicd/codebuild/docker_user`,
        `arn:aws:ssm:${Stack.of(this).region}:${Stack.of(this).account}:parameter/cicd/codebuild/docker_pass`
      ],
    });

    // Attach the policy to the CodeBuild project's role
    this.codeBuildProject.addToRolePolicy(parameterStorePolicy);

    // Grant permissions to CodeBuild to pull from the base image ECR repository
    props.appRunnerContainerRepo.grantPull(this.codeBuildProject);

    // Grant permissions to CodeBuild to push to the target ECR repository
    props.appRunnerContainerRepo.grantPullPush(this.codeBuildProject);

    // Grant permissions to CodeBuild to pull images from the base image ECR repository
    const ecrPolicy = new iam.PolicyStatement({
      actions: [
        "ecr:BatchGetImage",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetAuthorizationToken",
        "ecr:DescribeRepositories",
        "ecr:ListImages",
        "ecr:GetDownloadUrlForLayer"
      ],
      resources: [
        `arn:aws:ecr:${Stack.of(this).region}:${Stack.of(this).account}:repository/${mecabBaseImageEcrRepoName}`,
        `arn:aws:ecr:${Stack.of(this).region}:${Stack.of(this).account}:repository/${props.appRunnerContainerRepo.repositoryName}`,
      ],
    });

    // Attach the ECR policy to the CodeBuild project's role
    this.codeBuildProject.addToRolePolicy(ecrPolicy);
  }
} 