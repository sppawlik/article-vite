import { util } from "@aws-appsync/utils";
import * as ddb from "@aws-appsync/utils/dynamodb";

export function request(ctx) {
    const item = { ...ctx.arguments, createAd:  util.time.nowISO8601() };
    const key = { newsletterId: util.autoId() };
    return ddb.put({ key, item });
}

export function response(ctx) {
    return ctx.result;
}