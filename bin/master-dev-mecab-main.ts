#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { MasterDevMecabMainStack } from '../lib/stacks/master-dev-mecab-main-stack';
import { AWS_ENV } from '../config/constants';

const app = new cdk.App();

const projectInfo = app.node.tryGetContext('projectInfo');
const envKey = app.node.tryGetContext('env');
const envValues = app.node.tryGetContext(envKey);

// console.log(projectInfo);
// console.log(envKey);
// console.log(envValues);

new MasterDevMecabMainStack(app, `${envValues.envNameStack}${projectInfo.projectName}Stack`, {
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  projectInfo: projectInfo,
  env: envKey,
  envValues: envValues,
});