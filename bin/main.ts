import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { LambdaStack } from '../lib/lambda-stack';

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();
new LambdaStack(app, 'delete-my-tweets-lambda', { env });
