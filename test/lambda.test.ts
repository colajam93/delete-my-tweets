import { SynthUtils } from '@aws-cdk/assert';
import * as cdk from 'aws-cdk-lib';
import { ChatbotStack } from '../lib/chatbot-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { Setting } from '../lib/settings';

test('delete-my-tweets snapshot test', () => {
  const app = new cdk.App();
  const accountEnv = {
    region: 'dummy-dummy-1',
    account: 'dummy',
  };
  const setting: Setting = {
    userName: 'user_name',
    slack: {
      channelConfigurationName: 'configurationName',
      channelId: 'channelId',
      workspaceId: 'workspaceId',
    },
  };

  const lambdaStack = new LambdaStack(app, 'delete-my-tweets-lambda', { ...setting, env: accountEnv });
  expect(SynthUtils.toCloudFormation(lambdaStack)).toMatchSnapshot();

  const chatbotStack = new ChatbotStack(app, 'delete-my-tweets-chatbot', {
    slackChannelConfigurationName: setting.slack.channelConfigurationName,
    slackChannelId: setting.slack.channelId,
    slackWorkspaceId: setting.slack.workspaceId,
    functions: [lambdaStack.function],
    env: accountEnv,
  });
  chatbotStack.addDependency(lambdaStack);
  expect(SynthUtils.toCloudFormation(chatbotStack)).toMatchSnapshot();
});
