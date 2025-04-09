# Welcome to your CDK TypeScript project

This is a starter project for developing with the AWS Cloud Development Kit (CDK) using TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   - Compile TypeScript to JavaScript
* `npm run watch`   - Watch for changes and recompile
* `npm run test`    - Run the Jest unit tests
* `npx cdk deploy`  - Deploy this stack to your default AWS account/region
* `npx cdk diff`    - Compare the deployed stack with your current state
* `npx cdk synth`   - Emit the synthesized CloudFormation template

## Deployment Steps

1. **In `lambda-construct.ts`**: Comment out the SSM parameter store retrieval section and the "MECAB_API_URL" environment variable. This is because the "MECAB_API_URL" depends on the AppRunner service being created.

2. **In `master-dev-mecab-main-stack.ts`**: Comment out the `PipelineConstruct` and `AppRunnerConstruct`, and deploy the `LambdaConstruct` first. The pipeline creation depends on the Lambda function.

3. **In `master-dev-mecab-main-stack.ts`**: Uncomment the `PipelineConstruct` to deploy it. The AppRunner service creation depends on the ECR repository.

4. **In `master-dev-mecab-main-stack.ts`**: Uncomment the `AppRunnerConstruct` to deploy it.

5. **In `lambda-construct.ts`**: Uncomment the SSM parameter retrieval and the "MECAB_API_URL" environment variable.

