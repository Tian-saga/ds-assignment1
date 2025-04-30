// lambda/get.js

const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');

const ddb = new DynamoDBClient({});
const tableName = process.env.TABLE_NAME;

exports.handler = async (event) => {
  try {
    // read from pathParameters
    const { pk, sk } = event.pathParameters || {};

    if (!pk || !sk) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing pk or sk in path parameters' }),
      };
    }

    const result = await ddb.send(new GetItemCommand({
      TableName: tableName,
      Key: {
        PK: { S: pk },
        SK: { S: sk },
      },
    }));

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Item not found' }),
      };
    }

    const item = {
      PK: result.Item.PK.S,
      SK: result.Item.SK.S,
      description: result.Item.description?.S,
      someNumber: parseInt(result.Item.someNumber?.N || '0'),
      someBoolean: result.Item.someBoolean?.BOOL || false,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(item),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
