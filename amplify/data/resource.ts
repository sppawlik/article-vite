import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

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
      .authorization(allow => [allow.owner()])
      .identifier(['owner', 'link']),
});

// Used for code completion / highlighting when making requests from frontend
export type Schema = ClientSchema<typeof schema>;

// defines the data resource to be deployed
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: { expiresInDays: 30 }
  }
});
