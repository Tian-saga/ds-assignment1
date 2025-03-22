#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DatabaseStack } from '../lib/database-stack';
import { LambdaStack } from '../lib/lambda-stack';

const app = new cdk.App();

// Step 1: Create the database stack (DynamoDB)
const databaseStack = new DatabaseStack(app, 'DatabaseStack');

// Step 2: Create the Lambda stack and pass the DynamoDB table to it
new LambdaStack(app, 'LambdaStack', {
  table: databaseStack.table,
});
