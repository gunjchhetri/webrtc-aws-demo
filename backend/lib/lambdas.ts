import { Construct } from "constructs";
import path = require("path");

import { Duration } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";

export type LambdaFunc = Record<LambdaFnctions, NodejsFunction>;
enum LambdaFnctions {
  CONNECT_WEBSOCKET = "CONNECT_WEBSOCKET",
  DISCONNECT_WEBSOCKET = "DISCONNECT_WEBSOCKET",
  DEFAULT_SOCKET_CONNECTION = "DEFAULT_SOCKET_CONNECTION",
}
export const getFunctions = (scope: Construct): LambdaFunc => {
  const defaultSocketHandler = new NodejsFunction(scope, "DemoDefaultHandler", {
    functionName: "DemoDefaultHandler",
    timeout: Duration.minutes(2),
    runtime: Runtime.NODEJS_18_X,
    entry: path.join(__dirname, "../handlers/default-socket-handler.ts"),
    handler: "handler",
  });
  const connectionSocketHandler = new NodejsFunction(
    scope,
    "DemoConnectHandler",
    {
      functionName: "DemoConnectHandler",
      timeout: Duration.minutes(2),
      runtime: Runtime.NODEJS_18_X,
      entry: path.join(__dirname, "../handlers/socket-connection.ts"),
      handler: "handler",
    }
  );
  return {
    [LambdaFnctions.CONNECT_WEBSOCKET]: connectionSocketHandler,
    [LambdaFnctions.DISCONNECT_WEBSOCKET]: connectionSocketHandler, //change it with proper disconnect handler
    [LambdaFnctions.DEFAULT_SOCKET_CONNECTION]: defaultSocketHandler,
  };
};
