import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
  PostToConnectionCommandInput,
} from "@aws-sdk/client-apigatewaymanagementapi";

export class SocketService {
  _socketClient: ApiGatewayManagementApiClient;
  constructor(url: string) {
    this._socketClient = new ApiGatewayManagementApiClient({
      endpoint: url,
    });
  }
  sendMessage = async (connectionId: string, message: string) => {
    const params: PostToConnectionCommandInput = {
      ConnectionId: connectionId,
      Data: message,
    };
    const command = new PostToConnectionCommand(params);
    await this._socketClient.send(command);
  };
}
