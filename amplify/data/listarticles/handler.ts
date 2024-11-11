import type { Schema } from '../resource';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

type UserArticle = {
    owner: string;
    link: string;
    source?: string | null;
    htmlContent?: string | null;
    content?: string | null;
    title?: string | null;
    summary?: string | null;
    url?: string | null;
    publishedDate?: string | null;
    score?: any | null;
    createdAt: string;
    updatedAt: string;
};

interface CognitoIdentity {
    claims: {
        sub: string;
        username: string;
    };
}

export const handler: Schema["listArticles"]["functionHandler"] = async (event, context) => {
    // Calculate date 2 weeks ago
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const twoWeeksAgoStr = twoWeeksAgo.toISOString();

    // Get the owner from the authenticated user context
    if (!event.identity || !('claims' in event.identity)) {
        throw new Error('Unauthorized: User identity not found');
    }

    const identity = event.identity as CognitoIdentity;
    const owner = identity.claims.sub;

    // Query parameters using the secondary index
    const command = new QueryCommand({
        TableName: "UserArticle",
        IndexName: "owner-publishdate-index",
        KeyConditionExpression: "#ownerAttr = :ownerValue AND publishedDate >= :twoWeeksAgo",
        ExpressionAttributeNames: {
            "#ownerAttr": "owner"
        },
        ExpressionAttributeValues: {
            ":ownerValue": owner,
            ":twoWeeksAgo": twoWeeksAgoStr
        },
        Limit: event.arguments.limit || 100 // Use provided limit or default to 100
    });

    try {
        const response = await docClient.send(command);
        return (response.Items || []) as UserArticle[];
    } catch (error) {
        console.error('Error querying DynamoDB:', error);
        throw error;
    }
};
