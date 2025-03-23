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
  public readonly getLambda: Function;
  public readonly putLambda: Function;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    // "PostThingFunction" -> uses post.js
    this.postLambda = new Function(this, 'PostThingFunction', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'post.handler', // "post.js" -> exports.handler
      code: Code.fromAsset(path.join(__dirname, '../lambda')), // We'll zip everything in /lambda
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });

    // "GetThingFunction" -> uses get.js
    this.getLambda = new Function(this, 'GetThingFunction', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'get.handler', // "get.js" -> exports.handler
      code: Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });

    this.putLambda = new Function(this, 'PutThingFunction', {
        runtime: Runtime.NODEJS_18_X,
        handler: 'put.handler',    // "put.js" -> exports.handler
        code: Code.fromAsset(path.join(__dirname, '../lambda')),
        environment: {
          TABLE_NAME: props.table.tableName,
        },
      });

    // Grant DynamoDB read/write permissions to POST, and read to GET
    props.table.grantReadWriteData(this.postLambda);
    props.table.grantReadData(this.getLambda);
    props.table.grantReadWriteData(this.putLambda);
  }
}
