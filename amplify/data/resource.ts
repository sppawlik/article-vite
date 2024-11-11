import {a, defineData, type ClientSchema, defineFunction} from '@aws-amplify/backend';

// Define the function with IAM permissions using CDK constructs
export const listArticle = defineFunction({
    entry: './listarticles/handler.ts'
});

const schema = a.schema({
    Todo: a.model({
        content: a.string(),
        isDone: a.boolean()
    })
        .authorization(allow => [allow.owner()]),

    UserArticle: a.model({
        owner: a.string().required(),
        link: a.string().required(),
        source: a.string(),
        title: a.string(),
        summary: a.string(),
        url: a.string(),
        publishedDate: a.string(),
        score: a.json()
    })
        .authorization(allow => [
            allow.owner(),
        ])
        .identifier(['owner', 'link'])
        .secondaryIndexes((index) => [
            index('owner')
                .sortKeys(['publishedDate'])
                .name('owner-publishdate-index')
        ]),


    listArticles: a.query()
        .arguments({
            limit: a.integer()
        })
        .returns(a.ref('UserArticle').array())
        .authorization(allow => [allow.authenticated()])
        .handler(a.handler.function(listArticle)),

    UserArticles: a.customType({
        owner: a.string().required(),
        link: a.string().required(),
        source: a.string(),
        title: a.string(),
        summary: a.string(),
        url: a.string(),
        publishedDate: a.string(),
        score: a.json()
    }),

    scanUserArticles: a.query().arguments({
            limit: a.integer()
         })
        .returns(a.ref('UserArticles').array())
        .authorization(allow => [allow.authenticated()])
        .handler(a.handler.custom(
            {
                dataSource: "UserArticlesTableDataSource",
                entry: "./listuserarticles/listuserarticles.js",
            })
        ),

});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
    schema,
    functions: {listArticle},
    authorizationModes: {
        defaultAuthorizationMode: 'userPool',
        apiKeyAuthorizationMode: {expiresInDays: 30}
    }
});
