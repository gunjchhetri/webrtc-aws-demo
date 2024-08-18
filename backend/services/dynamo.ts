import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  marshallOptions,
  TranslateConfig,
  unmarshallOptions,
} from "@aws-sdk/lib-dynamodb";
const ddbClient = new DynamoDBClient({});
const marshallOptions: marshallOptions = {}; //handle marshall options
const unmarshallOptions: unmarshallOptions = {}; //handle unmarshall options
const translateConfig: TranslateConfig = { marshallOptions, unmarshallOptions };
export const dynamoClient = DynamoDBDocumentClient.from(
  ddbClient,
  translateConfig
);
