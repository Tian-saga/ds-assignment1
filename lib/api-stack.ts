// lib/api-stack.ts

import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LambdaIntegration, RestApi, UsagePlan, ApiKey, MethodLoggingLevel } from 'aws-cdk-lib/aws-apigateway';
import { Function } from 'aws-cdk-lib/aws-lambda';

interface ApiStackProps extends StackProps {
  postLambda: Function;
}

export class ApiStack extends Stack {
  public readonly apiKey: ApiKey;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Create a new REST API
    const api = new RestApi(this, 'ThingsApi', {
      restApiName: 'Things Service',
    });

    // Add a resource: /things
    const thingsResource = api.root.addResource('things');

    // Create Lambda integration for POST
    const postIntegration = new LambdaIntegration(props.postLambda);

    // Create an API key
    this.apiKey = new ApiKey(this, 'ThingsApiKey');

    // Create usage plan
    const plan = new UsagePlan(this, 'UsagePlan', {
      name: 'BasicUsagePlan',
      apiStages: [
        {
          api,
          stage: api.deploymentStage,
        },
      ],
    });

    // Associate the key with the plan
    plan.addApiKey(this.apiKey);

    // Add POST method with API key required
    thingsResource.addMethod('POST', postIntegration, {
      apiKeyRequired: true,
    });
  }
}
