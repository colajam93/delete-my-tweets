import * as chatbot from 'aws-cdk-lib/aws-chatbot';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface ChatbotStackProps extends cdk.StackProps {
  slackChannelConfigurationName: string;
  slackChannelId: string;
  slackWorkspaceId: string;
  functions?: ReadonlyArray<lambda.IFunction>;
}

export class ChatbotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ChatbotStackProps) {
    super(scope, id, props);

    const config = new chatbot.SlackChannelConfiguration(this, 'Chatbot', {
      ...props,
      logRetention: logs.RetentionDays.ONE_DAY,
    });
    for (const func of props.functions ?? []) {
      func.grantInvoke(config);
    }
  }
}
