import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { ChatbotStack } from '../lib/chatbot-stack';
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

const setting = loadSetting(`settings/${env}.yaml`);

const lambdaStack = new LambdaStack(app, 'delete-my-tweets-lambda', { ...setting, env: accountEnv });

const chatbotStack = new ChatbotStack(app, 'delete-my-tweets-chatbot', {
  slackChannelConfigurationName: setting.slack.channelConfigurationName,
  slackChannelId: setting.slack.channelId,
  slackWorkspaceId: setting.slack.workspaceId,
  functions: [lambdaStack.function],
  env: accountEnv,
});
chatbotStack.addDependency(lambdaStack);
