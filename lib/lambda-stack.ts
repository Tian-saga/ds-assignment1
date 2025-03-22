// lib/lambda-stack.ts

import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';

interface LambdaStackProps extends StackProps {
  table: Table;
}

export class LambdaStack extends Stack {
  public readonly postLambda: Function;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    // Here we define a standard Lambda function using a plain JS file (post.js)
    this.postLambda = new Function(this, 'PostThingFunction', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'post.handler',
      code: Code.fromAsset(path.join(__dirname, '../lambda')), // will look for "post.js"
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });

    // Grant read/write permissions on the DynamoDB table to this Lambda
    props.table.grantReadWriteData(this.postLambda);
  }
}
