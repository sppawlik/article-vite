import { generateClient } from "aws-amplify/api";
import { GraphQLResult } from '@aws-amplify/api-graphql';


export interface UserNewsletter {
    articles: {
        long: string[];
        medium: string[];
        short: string[];
    };
    baseNewsletter: string;
    createdAt: string;
    owner: string;
    status: string;
    updatedAt: string;
    id: string;
}

interface GetNewsletterResponse {
    getNewsletter: UserNewsletter
}

export async function getUserNewsletter(newsletterId: string): Promise<GetNewsletterResponse['getNewsletter']> {
    const client = generateClient();
    const query = /* GraphQL */ `
        query GetNewsletter {
            getNewsletter(id: "${newsletterId}") {
                articles {
                    long
                    medium
                    short
                }
                baseNewsletter
                createdAt
                owner
                status
                updatedAt
                id
            }
        }
    `;

    try {
        const response = await client.graphql({
            query,
        }) as GraphQLResult<GetNewsletterResponse>;

        if (!response.data?.getNewsletter) {
            throw new Error('Newsletter not found');
        }
        return response.data.getNewsletter;
    } catch (error) {
        console.error('Error fetching newsletter:', error);
        throw error;
    }
}
