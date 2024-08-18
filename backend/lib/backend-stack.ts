import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { TableConstruct } from "./table";
import { getFunctions } from "./lambdas";
import { WebSocket } from "./socket";

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const functions = getFunctions(this);
    new TableConstruct(this, "DemoAppTable", {
      functions,
    });

    new WebSocket(this, "DemoWebSocket", { functions });
  }
}
