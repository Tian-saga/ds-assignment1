// lib/database-stack.ts

import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';

export class DatabaseStack extends Stack {
  public readonly table: Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.table = new Table(this, 'ThingsTable', {
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: 'ThingsTable',
    });
  }
}
