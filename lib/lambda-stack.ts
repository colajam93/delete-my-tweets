import * as lambda_python from '@aws-cdk/aws-lambda-python-alpha';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export interface LambdaStackProps extends cdk.StackProps {
  readonly userName: string;
}

export class LambdaStack extends cdk.Stack {
  readonly function: lambda.IFunction;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const ssmKeyConsumerKey = `/app/lambda/delete-my-tweets/${props.userName}/consumer-key`;
    const ssmKeyConsumerSecret = `/app/lambda/delete-my-tweets/${props.userName}/consumer-secret`;
    const ssmKeyAccessToken = `/app/lambda/delete-my-tweets/${props.userName}/access-token`;
    const ssmKeyAccessTokenSecret = `/app/lambda/delete-my-tweets/${props.userName}/access-token-secret`;

    const func = new lambda_python.PythonFunction(this, 'Lambda', {
      entry: 'lambda/',
      index: 'main.py',
      runtime: lambda.Runtime.PYTHON_3_9,
      functionName: `delete-my-tweets-lambda-${props.userName}`,
      logRetention: logs.RetentionDays.ONE_MONTH,
      timeout: cdk.Duration.minutes(15),
      environment: {
        SSM_KEY_CONSUMER_KEY: ssmKeyConsumerKey,
        SSM_KEY_CONSUMER_SECRET: ssmKeyConsumerSecret,
        SSM_KEY_ACCESS_TOKEN: ssmKeyAccessToken,
        SSM_KEY_ACCESS_TOKEN_SECRET: ssmKeyAccessTokenSecret,
      },
    });
    this.function = func;

    for (const key of [ssmKeyConsumerKey, ssmKeyConsumerSecret, ssmKeyAccessToken, ssmKeyAccessTokenSecret]) {
      const k = key.split('/').pop();
      if (k) {
        const param = ssm.StringParameter.fromSecureStringParameterAttributes(this, k, {
          parameterName: key,
        });
        param.grantRead(func);
      }
    }
  }
}
