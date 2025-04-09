

interface PreExistingResourceNames {
    thisProjectCodeCommitRepoName: string;
    mecabBaseImageEcrRepoName: string;
}

interface NewResourceNames {
    appRunnerContainerRepoName: string;
    appRunnerServiceName: string;
    codeBuildAppRunnerProjectName: string;
    codeBuildLambdaProjectName: string;
    lambdaZipBucketName: string;
    pipelineName: string;
}

interface BranchNames {
    developBranchName: string;
    mainBranchName: string;
}

interface CommonResouceNames {
    lambdaFunctionName: string;
    apiGatewayName: string;
}

interface Path {
    apprunner_buildspecPath: string;
    lambda_buildspecPath: string;
    lambdaPath: string;
}

export interface Env {
    ENV_NAME: string;
    PRE_EXISTING_RESOURCE_NAMES: PreExistingResourceNames;
    NEW_RESOURCE_NAMES: NewResourceNames;
    COMMON_RESOURCE_NAMES: CommonResouceNames;
    BRANCH_NAMES: BranchNames;
    PATH: Path;
}

export interface CommonEnv {
    ENV_NAME: string;
    COMMON_RESOURCE_NAMES: CommonResouceNames;
    PATH: Path;
}