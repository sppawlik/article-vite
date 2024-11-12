import { util } from '@aws-appsync/utils';

export function request(ctx) {
    console.log('request2################################:',ctx);
    const { username } = ctx.identity.claims;
    // const { limit = 20, nextToken } = ctx.arguments;
    console.log('request2################################:',username);
    return {
        operation: 'Query',
        query: {
            expression: '#owner = :owner',
            expressionNames: {'#owner': 'owner'},
            expressionValues: util.dynamodb.toMapValues( {':owner': username} ),
        }
    }
}

export function response(ctx) {
    console.log('response################################');
    return  ctx.result;
}

