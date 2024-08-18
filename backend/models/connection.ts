import { dynamoClient } from "../services/dynamo";
import {
  PutCommandInput,
  PutCommand,
  QueryCommandInput,
  QueryCommand,
  DeleteCommand,
  DeleteCommandInput,
} from "@aws-sdk/lib-dynamodb";
export type ConnectionProps = {
  userName?: string;
  connectionId: string;
  status?: "active" | "inactive" | "oncall";
};
export const preparePutConnectionQuery = (
  tableName: string,
  props: ConnectionProps
): PutCommandInput => {
  return {
    TableName: tableName,
    Item: {
      PK: "CONNECTION#region",
      SK: `CONNECTION#${props.connectionId}`,
      ...props,
      ttl: Math.floor(Date.now() / 1000) + 3600,
    },
  };
};
export const saveConnection = async (
  tableName: string,
  props: ConnectionProps
) => {
  const conectionItemQuery = preparePutConnectionQuery(tableName, props);
  console.log("conectionItemQuery", conectionItemQuery);
  await dynamoClient.send(new PutCommand(conectionItemQuery));
};
export const getActiveConnection = async (tableName: string) => {
  const queryParam: QueryCommandInput = {
    TableName: tableName,
    KeyConditionExpression: "#pk = :pk",
    ExpressionAttributeValues: {
      ":pk": "CONNECTION#region" as any,
    },
    FilterExpression: "attribute_exists(userName)",
    ExpressionAttributeNames: {
      "#pk": "PK",
    },
  };
  console.log("queryParam", queryParam);
  const response = await dynamoClient.send(new QueryCommand(queryParam));
  console.log("response", response?.Items);
  if (response?.Items) {
    return response.Items?.map((obj) => ({
      connectionId: obj.connectionId,
      userName: obj.userName,
    }));
  } else {
    return [];
  }
};
export const deleteConection = async (
  tableName: string,
  connectionId: string
) => {
  const deleteParam: DeleteCommandInput = {
    TableName: tableName,
    Key: {
      PK: "CONNECTION#region",
      SK: `CONNECTION#${connectionId}`,
    },
  };
  console.log("deleteQuery", deleteParam);
  await dynamoClient.send(new DeleteCommand(deleteParam));
};
