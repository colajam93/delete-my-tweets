import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { LambdaStack } from '../lib/lambda-stack';
import { loadSetting } from '../lib/settings';

const accountEnv: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();

const env = app.node.tryGetContext('env');
if (!env) {
  throw Error("Missing '-c env={env}'");
}

const config = loadSetting(`settings/${env}.yaml`);

new LambdaStack(app, 'delete-my-tweets-lambda', { ...config, env: accountEnv });
