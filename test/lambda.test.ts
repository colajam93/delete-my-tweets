import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { LambdaStack } from '../lib/lambda-stack';
import { Setting } from '../lib/settings';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/lambda-stack.ts
test('delete-my-tweets snapshot test', () => {
  const app = new cdk.App();
  const env = {
    region: 'dummy-dummy-1',
    account: 'dummy',
  };
  const setting: Setting = {
    userName: 'user_name',
  };
  const stack = new LambdaStack(app, 'delete-my-tweets-lambda', {
    ...setting,
    env,
  });
  expect(Template.fromStack(stack).toJSON()).toMatchSnapshot();
});
