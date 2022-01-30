import * as lambda_python from '@aws-cdk/aws-lambda-python-alpha';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new lambda_python.PythonFunction(this, 'Lambda', {
      entry: 'lib/lambda',
      index: 'main.py',
      runtime: lambda.Runtime.PYTHON_3_9,
      functionName: 'delete-my-tweets-lambda',
      logRetention: logs.RetentionDays.ONE_MONTH,
      timeout: cdk.Duration.minutes(15),
    });
  }
}
