20109120
Zhong Zitian

Distributed Systems Assignment 1 – Serverless REST API
This project is a serverless REST API built with AWS CDK (TypeScript). It demonstrates the use of AWS services such as Lambda, DynamoDB, API Gateway, and Amazon Translate, all deployed via CDK. The key functionalities include:

POST /things: Create a new record in DynamoDB.

GET /things/{pk}/{sk}: Retrieve a single record by its composite key.

PUT /things/{pk}/{sk}: Update an existing record.

GET /things/{pk}/{sk}/translation?lang=xx: Translate the description field to a specified language and cache the result in DynamoDB.

API Key authorization: Protects certain endpoints (POST, PUT, and optionally GET) by requiring a valid x-api-key.

Table of Contents
Architecture Overview

Features

Deployment Instructions

Testing Instructions

Translation Caching Logic

Project Structure

References & Acknowledgments

Architecture Overview
This project uses a multi-stack approach with AWS CDK:

DatabaseStack: Creates a DynamoDB table (ThingsTable) with a composite primary key (PK and SK).

LambdaStack: Defines multiple AWS Lambda functions (for POST, GET, PUT, and Translation) and grants them permissions to interact with DynamoDB and Amazon Translate.

ApiStack: Sets up an API Gateway (REST API) with routes (/things, /things/{pk}/{sk}, etc.) and configures an API Key for authorization.

Features
POST /things

Purpose: Create a new item in DynamoDB.

Request Body (JSON):

json
复制
{
  "PK": "user001",
  "SK": "item001",
  "description": "Hello from user001",
  "someNumber": 123,
  "someBoolean": true
}
Response:

json
复制
{
  "message": "Item created successfully"
}
Authorization: Requires x-api-key.

GET /things/{pk}/{sk}

Purpose: Retrieve a single record by pk and sk.

Sample: GET /things/user001/item001

Response:

json
复制
{
  "PK": "user001",
  "SK": "item001",
  "description": "Hello from user001",
  "someNumber": 123,
  "someBoolean": true
}
Authorization: Optional (can also be protected by API Key if desired).

PUT /things/{pk}/{sk}

Purpose: Update fields (e.g., description, someNumber, someBoolean) of an existing record.

Sample:

bash
复制
PUT /things/user001/item001
{
  "description": "Updated description",
  "someNumber": 999
}
Response:

json
复制
{
  "message": "Item updated",
  "updated": {
    // Updated data from DynamoDB
  }
}
Authorization: Requires x-api-key.

GET /things/{pk}/{sk}/translation?lang=xx

Purpose: Translate the description field to a specified language code (xx) using Amazon Translate.

Sample: GET /things/user001/item001/translation?lang=fr

Response:

json
复制
{
  "original": "Hello from user001",
  "translated": "Bonjour de user001",
  "cached": false
}
If you call the same route again with the same language, cached becomes true, indicating the translation is fetched from DynamoDB cache instead of calling Translate again.

Authorization: Requires x-api-key.

Deployment Instructions
Prerequisites:

Node.js (v16 or later)

AWS CLI (with valid credentials via aws configure)

AWS CDK (globally installed)

Git for version control

Clone this repository:


bash
npm install
Synthesize & Deploy:

bash
npx cdk synth
npx cdk deploy --all

Once deployment completes, the terminal will output:

API Gateway URL (e.g., https://xxxx.execute-api.us-east-1.amazonaws.com/prod)

API Key (check the CloudFormation output or the API Gateway console).

Verification:

In the AWS Console:

DynamoDB → check ThingsTable

Lambda → check the functions for POST, GET, PUT, and Translate

API Gateway → check ThingsApi and its stages

Testing Instructions
You can use Postman or curl to test each endpoint.
Remember to include x-api-key: <api-key> if the endpoint is protected.

POST /things

Method: POST

URL: https://xxxx.execute-api.<region>.amazonaws.com/prod/things

Headers:

x-api-key: <api-key>

Content-Type: application/json

Body:

json

{
  "PK": "test001",
  "SK": "item001",
  "description": "Hello from test001",
  "someNumber": 123,
  "someBoolean": true
}
Expected Response: {"message":"Item created successfully"}

GET /things/test001/item001

Method: GET

URL: https://xxxx.execute-api.<region>.amazonaws.com/prod/things/test001/item001

Headers:

x-api-key: <your-api-key> (if protected)

Expected Response:

json

{
  "PK": "test001",
  "SK": "item001",
  "description": "Hello from test001",
  "someNumber": 123,
  "someBoolean": true
}
PUT /things/test001/item001

Method: PUT

URL: https://xxxx.execute-api.<region>.amazonaws.com/prod/things/test001/item001

Headers:

x-api-key: <your-api-key>

Content-Type: application/json

Body:

json

{
  "description": "Updated description from PUT",
  "someNumber": 999
}
Expected Response:

json

{
  "message": "Item updated",
  "updated": {
    ...
  }
}
GET /things/test001/item001/translation?lang=fr

Method: GET

URL: https://xxxx.execute-api.<region>.amazonaws.com/prod/things/test001/item001/translation?lang=fr

Headers:

x-api-key: <your-api-key>

First Response:

json

{
  "original": "Updated description from PUT",
  "translated": "Bonjour de PUT",
  "cached": false
}
Second Response (same URL):

json

{
  "original": "Updated description from PUT",
  "translated": "Bonjour de PUT",
  "cached": true
}
DynamoDB will store this under translations.fr for future calls.

Translation Caching Logic
When calling the Translate endpoint:

The Lambda function fetches the item from DynamoDB.

Checks if translations[lang] already exists in the record.

If it does, returns cached: true.

If not, it calls Amazon Translate, updates translations[lang] in the item, and returns cached: false.

This approach avoids repeated calls to Translate for the same text and language.

Project Structure
Below is an example structure (your actual structure may vary):

python

ds-assignment1/
├── bin/
│   └── ds-assignment1.ts         # CDK App entry point
├── lib/
│   ├── database-stack.ts         # DynamoDB stack
│   ├── lambda-stack.ts           # Lambda functions stack
│   ├── api-stack.ts              # API Gateway stack
├── lambda/
│   ├── post.js
│   ├── get.js
│   ├── put.js
│   └── translate.js
├── package.json
├── cdk.json
├── tsconfig.json
├── README.md                     # This file (project documentation)
└── ...
