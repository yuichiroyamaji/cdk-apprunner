// Account and region configuration
export const AWS_ENV = {
  account: '588907989152',
  region: 'ap-northeast-1',
}; 

const BRANCH_NAMES = {
  developBranchName: 'develop',
  mainBranchName: 'master',
};

const ENV_NAMES = {
  dev: 'Dev',
  prd: 'Prd',
}

const PATH = {
  apprunner_buildspecPath: 'cicd/apprunner_buildspec.yml',
  lambda_buildspecPath: 'cicd/lambda_buildspec.yml',
  lambdaPath: 'src/lambda',
};

const COMMON_RESOURCE_NAMES = {
    lambdaFunctionName: 'tci-dev-address-correction-function',
    apiGatewayName: 'jp-address-corrector-api',
};

export const COMMON_ENV = {
  ENV_NAME: ENV_NAMES.dev,
  COMMON_RESOURCE_NAMES : COMMON_RESOURCE_NAMES,
  PATH : PATH
};

export const DEV_ENV = {
  ENV_NAME: ENV_NAMES.dev,
  PRE_EXISTING_RESOURCE_NAMES : {
    thisProjectCodeCommitRepoName: 'master-dev-mecab-main',
    mecabBaseImageEcrRepoName: 'mecab-base-image',
  },
  NEW_RESOURCE_NAMES : {
    appRunnerContainerRepoName: 'tci-dev-mecab-app-runner-repo',
    appRunnerServiceName: 'tci-dev-mecab-app-runner-service',
    codeBuildAppRunnerProjectName: 'tci-dev-mecab-apprunner-codebuild-project',
    codeBuildLambdaProjectName: 'tci-dev-mecab-lambda-codebuild-project',
    lambdaZipBucketName: 'tci-dev-address-correction-function-zip',
    pipelineName: 'tci-dev-mecab-pipeline',
  },
  COMMON_RESOURCE_NAMES : COMMON_RESOURCE_NAMES,
  BRANCH_NAMES : BRANCH_NAMES,
  PATH : PATH
};