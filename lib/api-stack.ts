// lib/api-stack.ts

import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LambdaIntegration, RestApi, UsagePlan, ApiKey } from 'aws-cdk-lib/aws-apigateway';
import { LambdaStack } from './lambda-stack';

interface ApiStackProps extends StackProps {
  postLambda: LambdaStack['postLambda'];
  getLambda: LambdaStack['getLambda'];
  putLambda: LambdaStack['putLambda'];
  translateLambda: LambdaStack['translateLambda'];
}

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const api = new RestApi(this, 'ThingsApi', {
      restApiName: 'Things Service',
      deployOptions: {
        stageName: 'prod',
      },
    });

    // POST /things
    const thingsResource = api.root.addResource('things');
    thingsResource.addMethod('POST', new LambdaIntegration(props.postLambda), {
      apiKeyRequired: true,
    });

    // GET /things/{pk}/{sk}
    const pkResource = thingsResource.addResource('{pk}');
    const skResource = pkResource.addResource('{sk}');

    skResource.addMethod('GET', new LambdaIntegration(props.getLambda), {
      apiKeyRequired: true, 
    });

    // Add PUT
    skResource.addMethod('PUT', new LambdaIntegration(props.putLambda), {
    apiKeyRequired: true,
    });

    // Create usage plan and API key
    const apiKey = new ApiKey(this, 'ThingsApiKey');
    const plan = new UsagePlan(this, 'UsagePlan', {
      name: 'BasicUsagePlan',
      apiStages: [{ api, stage: api.deploymentStage }],
    });
    plan.addApiKey(apiKey);
    const translationResource = skResource.addResource('translation');
    translationResource.addMethod('GET', new LambdaIntegration(props.translateLambda), {
      apiKeyRequired: true, 
    });

  }
}
