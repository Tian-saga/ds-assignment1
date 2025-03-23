## Serverless REST Assignment - Distributed Systems.

__Name:__ Zhong Zitian

__Demo:__ (https://youtu.be/Rjxgrf-EAxU)

### Context.

State the context you chose for your web API and detail the attributes of the DynamoDB table items, e.g.

Context:
For this assignment, I created a **DynamoDB table** called **ThingsTable**, storing records referred to as “things.” Each record includes:

Table item attributes:
- **PK** (string) – Partition key
- **SK** (string) – Sort key
- **description** (string)
- **someNumber** (number)
- **someBoolean** (boolean)
- **translations** (map) – Stores cached translations keyed by language code

### App API endpoints.

Below are the endpoints I successfully implemented (excluding any separate authentication endpoints):

1. **POST** `/things`  
   - Creates a new item in DynamoDB.  
   - Requires `x-api-key` for authorization.

2. **GET** `/things/{pk}/{sk}`  
   - Retrieves the item identified by partition key (`pk`) and sort key (`sk`).  
   - Can optionally require `x-api-key`, depending on the configuration.

3. **PUT** `/things/{pk}/{sk}`  
   - Updates fields (such as `description`, `someNumber`, `someBoolean`) of an existing item.  
   - Requires `x-api-key`.

4. **GET** `/things/{pk}/{sk}/translation?lang=xx`  
   - Uses Amazon Translate to convert the `description` field to language `xx` and caches the result in DynamoDB.  
   - Requires `x-api-key`.



### Features.

#### Translation persistence 

I store translation caches in the `translations` map attribute within each item. For example:

```json
{
  "PK": "001",
  "SK": "001",
  "description": "Hello from item 001",
  "someNumber": 123,
  "someBoolean": true,
  "translations": {
    "fr": "Bonjour de l'item 001"
  }
}

#### Custom L2 Construct 

Not complete

#### Multi-Stack app (if completed)

Yes, the application is composed of multiple AWS CDK stacks:

DatabaseStack: Creates the DynamoDB table (ThingsTable) with PK and SK
LambdaStack: Defines multiple Lambda functions (POST, GET, PUT, and translation), granting permissions for DynamoDB and Amazon Translate
ApiStack: Creates the API Gateway, routes each Lambda function, and configures an API Key and Usage Plan

#### Lambda Layers (if completed)

Not complete


#### API Keys. 


To protect certain API endpoints in API Gateway, I implemented API key authentication. Here is a brief explanation with relevant code excerpts:

1. **Create an API Key and Usage Plan**: In `ApiStack`, an `ApiKey` resource is generated and attached to a `UsagePlan`. Only requests that provide the correct key in the `x-api-key` header will be allowed on protected endpoints.

2. **Example Code**:

~~~ts
import { ApiKey, UsagePlan, UsagePlanProps } from 'aws-cdk-lib/aws-apigateway';

// Create the API Key
const apiKey = new ApiKey(this, 'ThingsApiKey');

// Create a Usage Plan
const plan = new UsagePlan(this, 'UsagePlan', {
  name: 'BasicUsagePlan',
  apiStages: [
    {
      api,              // Reference to the RestApi or HttpApi
      stage: api.deploymentStage,
    },
  ],
});
plan.addApiKey(apiKey);

// Example: Protecting the POST /things route:
thingsResource.addMethod('POST', new LambdaIntegration(props.postLambda), {
  apiKeyRequired: true,
});
~~~

3. **Client Usage**:  
Clients must include the following header in their requests:
x-api-key: <the-api-key-value>
Any request missing this header (or providing an invalid key) will receive a `403 Forbidden` response.


###  Extra (If relevant).
No additional CDK/serverless features 