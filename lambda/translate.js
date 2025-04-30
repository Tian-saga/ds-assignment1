// lambda/translate.js

const { DynamoDBClient, GetItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate');

const ddb = new DynamoDBClient({});
const translateClient = new TranslateClient({});
const tableName = process.env.TABLE_NAME;

exports.handler = async (event) => {
  try {
    // We read pk/sk from path parameters, e.g. /things/{pk}/{sk}/translation
    // We read target language from query string: ?lang=fr
    const { pk, sk } = event.pathParameters || {};
    const lang = (event.queryStringParameters?.lang || 'en').toLowerCase();

    if (!pk || !sk) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing pk or sk in path parameters' }),
      };
    }

    // 1) Read the item from DynamoDB
    const getResult = await ddb.send(new GetItemCommand({
      TableName: tableName,
      Key: {
        PK: { S: pk },
        SK: { S: sk },
      },
    }));

    if (!getResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Item not found' }),
      };
    }

    // Extract the original text to be translated
    const originalDescription = getResult.Item.description?.S || '';

    // 2) Check if translations already exist
    //    translations is a Map. If present, see if translations[lang] exists
    let translations = getResult.Item.translations?.M || {};

    if (translations[lang]?.S) {
      // We already have a cached translation for this language
      return {
        statusCode: 200,
        body: JSON.stringify({
          original: originalDescription,
          translated: translations[lang].S,
          cached: true,
        }),
      };
    }

    // 3) If no cached translation, call Amazon Translate
    const translateResult = await translateClient.send(new TranslateTextCommand({
      SourceLanguageCode: 'auto',  // let AWS auto detect source
      TargetLanguageCode: lang,
      Text: originalDescription,
    }));

    const translatedText = translateResult.TranslatedText;

    // 4) Update the item in DynamoDB to store the new translation under translations[lang]
    // We'll do a partial update:
    //   translations.lang = translatedText
    // We have to build the UpdateExpression carefully
    const updatedTranslations = {
      ...objFromDynamoMap(translations),
      [lang]: translatedText,
    };

    await ddb.send(new UpdateItemCommand({
      TableName: tableName,
      Key: {
        PK: { S: pk },
        SK: { S: sk },
      },
      UpdateExpression: 'SET #trans = :val',
      ExpressionAttributeNames: {
        '#trans': 'translations',
      },
      ExpressionAttributeValues: {
        ':val': toDynamoMap(updatedTranslations),
      },
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        original: originalDescription,
        translated: translatedText,
        cached: false,
      }),
    };
  } catch (error) {
    console.error('Error in translate function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

/**
 * Convert a JS object to DynamoDB M structure
 */
function toDynamoMap(obj) {
  const map = {};
  for (const key of Object.keys(obj)) {
    map[key] = { S: obj[key] };
  }
  return { M: map };
}

/**
 * Convert DynamoDB M structure back to a JS object
 */
function objFromDynamoMap(dynamoMap) {
  const jsObj = {};
  for (const [k, v] of Object.entries(dynamoMap)) {
    if (v.S) jsObj[k] = v.S;
  }
  return jsObj;
}
