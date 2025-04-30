// lambda/post.js

const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const ddb = new DynamoDBClient({});
const tableName = process.env.TABLE_NAME;

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { PK, SK, description, someNumber, someBoolean } = body;

    if (!PK || !SK) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing PK or SK' }),
      };
    }

    await ddb.send(new PutItemCommand({
      TableName: tableName,
      Item: {
        PK: { S: PK },
        SK: { S: SK },
        description: { S: description || '' },
        someNumber: { N: (someNumber ?? 0).toString() },
        someBoolean: { BOOL: !!someBoolean },
      },
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Item created successfully' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
