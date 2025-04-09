import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AppRunnerConstruct } from '../constructs/apprunner-construct';
import { LambdaConstruct } from '../constructs/lambda-construct';
import { PipelineConstruct } from '../constructs/pipeline-construct';
import { DEV_ENV, COMMON_ENV } from '../../config/constants';
import { projectInfo, env, envValues } from '../../config/types';

interface MasterDevMecabMainStackProps extends cdk.StackProps {
  projectInfo: projectInfo,
  env: env,
  envValues: envValues,
}

export class MasterDevMecabMainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MasterDevMecabMainStackProps) {
    super(scope, id, props);

    // Use the Lambda construct
    new LambdaConstruct(this, 'LambdaConstruct', {
      envValues: props.envValues,
    });

    // Use the Pipeline construct
    new PipelineConstruct(this, 'PipelineConstructDev', {
      projectInfo: props.projectInfo,
      envValues: props.envValues,
    });

    // Use the AppRunner construct
    new AppRunnerConstruct(this, 'AppRunnerConstruct', {
      envValues: props.envValues,
    });

    // Ensure the pipeline construct depends on the AppRunner construct
    // appRunnerConstruct.node.addDependency(pipelineConstruct);
  }
}
