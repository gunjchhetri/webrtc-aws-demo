import { WebSocketApi, WebSocketStage } from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { LambdaFunc } from "./lambdas";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
export interface WebSocketProps {
  functions: LambdaFunc;
}
export class WebSocket extends Construct {
  socketSever: WebSocketApi;
  constructor(scope: Construct, id: string, props: WebSocketProps) {
    super(scope, id);
    this.socketSever = new WebSocketApi(this, "DemoWebsocketApi", {
      connectRouteOptions: {
        //authorizer: ....setup auhorizer in real life scenario
        integration: new integrations.WebSocketLambdaIntegration(
          "ConnectHandler",
          props.functions.CONNECT_WEBSOCKET
        ),
      },
      disconnectRouteOptions: {
        integration: new integrations.WebSocketLambdaIntegration(
          "ConnectHandler",
          props.functions.DISCONNECT_WEBSOCKET
        ),
      },
      defaultRouteOptions: {
        integration: new integrations.WebSocketLambdaIntegration(
          "DefaultHandler",
          props.functions.DEFAULT_SOCKET_CONNECTION
        ),
      },
    });
    new WebSocketStage(this, "ProdStage", {
      webSocketApi: this.socketSever,
      stageName: "prod",
      autoDeploy: true, //without api deploy, websocke wont work
    });
    const socketUrl = `wss://${this.socketSever.apiId}.execute-api.${this.socketSever.env.region}.amazonaws.com/prod`;
    const socketManagementApi = `https://${this.socketSever.apiId}.execute-api.${this.socketSever.env.region}.amazonaws.com/prod`;
    console.log("socketUrl", socketUrl);
    console.log(`socketManagementApi`, socketManagementApi);
    props.functions.CONNECT_WEBSOCKET.addEnvironment(
      "ConnectionUrl",
      socketManagementApi
    );
    props.functions.DEFAULT_SOCKET_CONNECTION.addEnvironment(
      "ConnectionUrl",
      socketManagementApi
    );
    this.grantSendPermissionToLambda(props.functions);
  }
  addRoute(route: string, handler: NodejsFunction) {
    this.socketSever.addRoute(route, {
      integration: new integrations.WebSocketLambdaIntegration(
        `CustomRoute${route}`,
        handler
      ),
    });
  }
  grantSendPermissionToLambda = (functions: LambdaFunc) => {
    Object.values(functions).forEach((lambda) =>
      this.socketSever.grantManageConnections(lambda)
    );
  };
}
