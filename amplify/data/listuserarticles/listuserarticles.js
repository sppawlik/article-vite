import * as ddb from '@aws-appsync/utils/dynamodb';

export function request(ctx) {
    console.log('request################################');
    const { limit = 20, nextToken } = ctx.arguments;
    return { operation: 'Scan' };
}

export function response(ctx) {
    console.log('response################################');
    const { items: userArticles = [] } = ctx.result;
    console.log('userArticles size:', Object.keys(ctx.result));
    return  userArticles ;
}

