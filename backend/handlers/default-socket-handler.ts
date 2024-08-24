import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { getActiveConnection, saveConnection } from "../models/connection";
import { SocketEventType, SocketService } from "../services/socket";
export const handler = async (event: APIGatewayProxyEvent) => {
  console.log("Default route event: ", event.body);

  const { connectionId = "" } = event.requestContext;
  const { type, payload } = JSON.parse(event.body!);

  if (type == SocketEventType.REGISTER) {
    await saveConnection(process.env.TableName!, {
      connectionId,
      userName: payload.userName,
    });
    await handlUserRegistration(connectionId!, payload.userName);
  }
  if (type == SocketEventType.INCOMING_CALL) {
    await handleIncomingCall(
      payload.receiverConnectioId,
      connectionId,
      payload.channelName
    );
  }
  return { statusCode: 200 };
};
const handlUserRegistration = async (
  connectionId: string,
  userName: string
) => {
  const allConnections = await getActiveConnection(process.env.TableName!);
  const filteredConnections = allConnections.filter(
    (obj) => obj.userName && obj.connectionId != connectionId
  );
  const socketService = new SocketService(process.env.ConnectionUrl!);
  socketService.sendMessage(
    connectionId,
    JSON.stringify({
      type: "AVAILABLE_CONNECTIONS",
      allConnections: filteredConnections,
    })
  );
  await boradcastStatus(
    filteredConnections,
    JSON.stringify({
      newConnection: { connectionId, userName },
      type: SocketEventType.NEW_CONNECTION,
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
const handleIncomingCall = async (
  receiverConnectioId: string,
  senderConectionId: string,
  channelName: string
) => {
  const socketService = new SocketService(process.env.ConnectionUrl!);
  const message = {
    incomingCall: { connectionId: senderConectionId, channelName },
    type: SocketEventType.INCOMING_CALL,
  };
  await socketService.sendMessage(receiverConnectioId, JSON.stringify(message));
};
