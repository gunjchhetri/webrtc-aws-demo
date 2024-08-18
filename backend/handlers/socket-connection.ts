import { APIGatewayProxyEvent } from "aws-lambda";

import {
  deleteConection,
  getActiveConnection,
  saveConnection,
} from "../models/connection";
import { SocketService } from "../services/socket";

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log(event);
  const connectionId = event.requestContext.connectionId!;
  const eventType = event.requestContext.eventType;
  console.log("eventType", eventType);
  if (eventType == "DISCONNECT") {
    await deleteConection(process.env.TableName!, connectionId);
    const allConnections = await getActiveConnection(process.env.TableName!);
    console.log(allConnections);
    //handle user dosconect
  } else {
    const allConnections = await getActiveConnection(process.env.TableName!);
    console.log("allConnections", allConnections);
    await saveConnection(process.env.TableName!, { connectionId });
  }
  return {
    statusCode: 200,
  };
};
