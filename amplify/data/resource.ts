import {a, defineData, type ClientSchema, defineFunction} from '@aws-amplify/backend';


const schema = a.schema({
    Todo: a.model({
        content: a.string(),
        isDone: a.boolean()
    })
        .authorization(allow => [allow.owner()]),


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

    UserArticlesConnection: a.customType({
        items: a.ref('UserArticles').array().required(),
        nextToken: a.string()
    }),

    listNewestUserArticles: a.query().arguments({
            limit: a.integer()
         })
        .returns(a.ref('UserArticlesConnection').required())
        .authorization(allow => [allow.authenticated()])
        .handler(a.handler.custom(
            {
                dataSource: "UserArticlesTableDataSource",
                entry: "./listuserarticles/listuserarticles.js",
            })
        ),

    Newsletter: a.customType({
        newsletterId: a.string().required(),
        articles: a.json(),
        baseNewsletter: a.string(),
        createdAt: a.string(),
        updatedAt: a.string(),
        status: a.enum(['PENDING', 'GENERATED'])
    }),

    addNewsletter: a.mutation()
        .arguments({
            articles: a.json().required(),
            status: a.enum(['PENDING', 'GENERATED'])
            })
        .returns(a.ref('Newsletter').required())
        .authorization(allow => [allow.authenticated()])
        .handler(
            a.handler.custom({
                dataSource:'NewsletterTableDataSource',
                entry: './addnewsletter/addnewsletter.js'
            })
        ),

});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: 'userPool',
        apiKeyAuthorizationMode: {expiresInDays: 30}
    }
});
