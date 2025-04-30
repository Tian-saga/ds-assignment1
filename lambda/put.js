// lambda/put.js

const { DynamoDBClient, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');

const ddb = new DynamoDBClient({});
const tableName = process.env.TABLE_NAME;

exports.handler = async (event) => {
  try {
    const { pk, sk } = event.pathParameters || {};
    if (!pk || !sk) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing pk or sk in path parameters' }),
      };
    }

    // We read the new fields from JSON body
    const body = JSON.parse(event.body || '{}');
    const { description, someNumber, someBoolean } = body;

    // Build an UpdateExpression
    let updateExp = [];
    let expAttrValues = {};

    if (description !== undefined) {
      updateExp.push('description = :desc');
      expAttrValues[':desc'] = { S: description };
    }
    if (someNumber !== undefined) {
      updateExp.push('someNumber = :num');
      expAttrValues[':num'] = { N: someNumber.toString() };
    }
    if (someBoolean !== undefined) {
      updateExp.push('someBoolean = :bool');
      expAttrValues[':bool'] = { BOOL: !!someBoolean };
    }

    if (updateExp.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'No fields to update' }),
      };
    }

    const updateExpression = 'SET ' + updateExp.join(', ');

    const result = await ddb.send(new UpdateItemCommand({
      TableName: tableName,
      Key: {
        PK: { S: pk },
        SK: { S: sk },
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expAttrValues,
      ReturnValues: 'ALL_NEW',
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Item updated', updated: result.Attributes }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
