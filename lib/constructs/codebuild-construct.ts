import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';

interface CodeBuildConstructProps {
  codeCommitRepo: codecommit.IRepository;
  repository: ecr.IRepository;
  baseImageRepositoryName: string;
}

export class CodeBuildConstruct extends Construct {
  public readonly codeBuildProject: codebuild.IProject;

  constructor(scope: Construct, id: string, props: CodeBuildConstructProps) {
    super(scope, id);

    const accountId = Stack.of(this).account;
    const region = Stack.of(this).region;

    const repositoryUri = `${accountId}.dkr.ecr.${region}.amazonaws.com/${props.repository.repositoryName}`;
    const baseImageRepositoryUri = `${accountId}.dkr.ecr.${region}.amazonaws.com/${props.baseImageRepositoryName}`;

    const codeBuildProject = new codebuild.Project(this, 'MyCodeBuildProject', {
      source: codebuild.Source.codeCommit({
        repository: props.codeCommitRepo,
        branchOrRef: 'develop',
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
        privileged: true,
        environmentVariables: {
          repositoryUri: { value: repositoryUri },
          baseImageRepositoryUri: { value: baseImageRepositoryUri },
        //   DOCKER_USERNAME: { value: process.env.DOCKER_USERNAME || '' },
        //   DOCKER_PASSWORD: { value: process.env.DOCKER_PASSWORD || '' },
        },
      },
      buildSpec: codebuild.BuildSpec.fromSourceFilename('cicd/buildspec.yml'),
    });

    // Create the IAM policy for accessing Parameter Store
    const parameterStorePolicy = new iam.PolicyStatement({
      actions: [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath"
      ],
      resources: [
        `arn:aws:ssm:${region}:${accountId}:parameter/cicd/codebuild/docker_user`,
        `arn:aws:ssm:${region}:${accountId}:parameter/cicd/codebuild/docker_pass`
      ],
    });

    // Attach the policy to the CodeBuild project's role
    codeBuildProject.addToRolePolicy(parameterStorePolicy);

    // Grant permissions to CodeBuild to pull from the base image ECR repository
    props.repository.grantPull(codeBuildProject);

    // Grant permissions to CodeBuild to push to the target ECR repository
    props.repository.grantPullPush(codeBuildProject);

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
        `arn:aws:ecr:${region}:${accountId}:repository/${props.baseImageRepositoryName}`,
        `arn:aws:ecr:${region}:${accountId}:repository/${props.repository.repositoryName}`,
      ],
    });

    // Attach the ECR policy to the CodeBuild project's role
    codeBuildProject.addToRolePolicy(ecrPolicy);

    this.codeBuildProject = codeBuildProject;
  }
} 