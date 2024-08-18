import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
  PostToConnectionCommandInput,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { getActiveConnection, saveConnection } from "../models/connection";
import { SocketService } from "../services/socket";
export const handler = async (event: APIGatewayProxyEvent) => {
  console.log("Default route event: ", event.body);

  const { connectionId = "" } = event.requestContext;
  const { type, userName } = JSON.parse(event.body!);
  const client = new ApiGatewayManagementApiClient({
    endpoint: process.env.ConnectionUrl!,
  });
  if (type == "REGISTER") {
    await saveConnection(process.env.TableName!, { connectionId, userName });
    await handlUserRegistration(connectionId!, userName, client);
  }

  console.log("watitng..", process.env.ConnectionUrl!);

  return { statusCode: 200 };
};
const handlUserRegistration = async (
  connecionId: string,
  userName: string,
  client: ApiGatewayManagementApiClient
) => {
  const allConnections = await getActiveConnection(process.env.TableName!);
  const filteredConnections = allConnections.filter(
    (obj) => obj.userName && obj.connectionId != connecionId
  );
  const socketService = new SocketService(process.env.ConnectionUrl!);
  socketService.sendMessage(
    connecionId,
    JSON.stringify({
      type: "AVAILABLE_CONNECTIONS",
      allConnections: filteredConnections,
    })
  );
  await boradcastStatus(
    filteredConnections,
    JSON.stringify({
      newConnection: { connecionId, userName },
      type: "NEW_CONNECTION",
    })
  );
};
const boradcastStatus = async (allConnections: Array<any>, message: string) => {
  const socketService = new SocketService(process.env.ConnectionUrl!);
  if (allConnections?.length) {
    for (const connecttion of allConnections!) {
      await socketService
        .sendMessage(connecttion.connectionId as any, message)
        .catch((err) => console.log("Destroyed connection", connecttion));
    }
  }
};
