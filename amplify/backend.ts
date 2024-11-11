import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import {data, listArticle} from "./data/resource";
import {aws_dynamodb} from "aws-cdk-lib";

const backend = defineBackend({
  auth,
  data
});

const t = backend.data.resources.tables['UserArticle'];

console.log('test2')


const externalDataSourcesStack = backend.createStack("DynamoDataSources");


const externalTable = aws_dynamodb.Table.fromTableName(
    externalDataSourcesStack,
    "DynamoDataSources",
    "UserArticles"
);


backend.data.addDynamoDbDataSource(
    "UserArticlesTableDataSource",
    externalTable
);

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
