import { Construct } from "constructs";
import { Stack } from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { LambdaFunc } from "./lambdas";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
type TableProps = {
  functions: LambdaFunc;
};
export class TableConstruct extends Construct {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: TableProps) {
    super(scope, id);
    this.table = new dynamodb.Table(this, "DemoAppTable", {
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      tableName: "DemoAppTable",
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: "ttl",
    });
    this.grantPermissionToLambdas([
      props.functions.CONNECT_WEBSOCKET,
      props.functions.DEFAULT_SOCKET_CONNECTION,
    ]);
    props.functions.CONNECT_WEBSOCKET.addEnvironment(
      "TableName",
      this.table.tableName
    );
    props.functions.DEFAULT_SOCKET_CONNECTION.addEnvironment(
      "TableName",
      this.table.tableName
    );
  }
  grantPermissionToLambdas = (lambdas: NodejsFunction[]) => {
    lambdas.forEach((lambda) => this.table.grantReadWriteData(lambda));
  };
}
