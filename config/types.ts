export type projectInfo = {
    projectName: string,
    projectRepoName: string,
    projectMecabRepoName: string
};

export type env = {
    account: string, 
    region: string
};

export type envValues = {
    description: string,
    envName: string,
    envNameStack: string,
    branchName: string,
    env: env
};

