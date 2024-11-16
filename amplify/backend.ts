import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import {data} from "./data/resource";
import {aws_dynamodb} from "aws-cdk-lib";

const backend = defineBackend({
  // data
});

// const externalDataSourcesStack = backend.createStack("DynamoDataSources");
//
// const externalTable = aws_dynamodb.Table.fromTableName(
//     externalDataSourcesStack,
//     "DynamoDataSources",
//     "UserArticles"
// );
//
// backend.data.addDynamoDbDataSource(
//     "UserArticlesTableDataSource",
//     externalTable
// );
//
// const newsletters = aws_dynamodb.Table.fromTableName(
//     externalDataSourcesStack,
//     "NewslettersTableDataSource",
//     "NewslettersTable"
// );
//
// backend.data.addDynamoDbDataSource(
//     "NewslettersTableDataSource",
//     newsletters
// )

// const newsletterDataSourcesStack = backend.createStack("NewsletterDynamoDataSources");
//
// const newsletterTable = aws_dynamodb.Table.fromTableName(
//     externalDataSourcesStack,
//     "DynamoDataSources",
//     "Newsletters"
// );
//
// backend.data.addDynamoDbDataSource(
//     "NewsletterTableDataSource",
//     newsletterTable
// );


//
// const queryPolicyStatement = new PolicyStatement({
//   effect: Effect.ALLOW,
//   actions: ['dynamodb:Query'],
//   resources: [
//     t.tableArn,
//     `${t.tableArn}/index/*`
//   ]
// });
// console.log(backend.data.resources)
// Add the policy to the function
