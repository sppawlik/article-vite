import { SummarySize, Newsletter } from '../types/types';
import { generateClient } from "aws-amplify/api";
import { GraphQLResult } from '@aws-amplify/api-graphql';

interface NewsletterArticles {
    articles: Record<SummarySize, string[]>;
}

interface NewsletterResponse {
    newsletterId: string;
}

interface CreateNewsletterResponse {
    createNewsletter: {
        createdAt: string;
        owner: string;
        status: string;
        updatedAt: string;
        articles: {
            long: string[];
            medium: string[];
            short: string[];
        };
    };
}

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

const NEWSLETTER_API_URL = 'https://2ps0c9g84d.execute-api.eu-central-1.amazonaws.com/prod/newsletter';

export async function getUserNewsletter(newsletterId: string): Promise<GetNewsletterResponse['getNewsletter']> {
    const client = generateClient();
    const query = /* GraphQL */ `
        query ListUserArticles {
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

export async function submitNewsletter(articles: NewsletterArticles): Promise<string> {
    try {
        const response = await fetch(NEWSLETTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(articles)
        });

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            throw new Error(`Failed to submit newsletter: ${response.statusText}`);
        }

        const data: NewsletterResponse = await response.json();
        return data.newsletterId;
    } catch (error) {
        console.error('Error submitting newsletter:', error);
        throw error;
    }
}

export async function getNewsletter(newsletterId: string): Promise<Newsletter> {
    try {
        const response = await fetch(`${NEWSLETTER_API_URL}/${newsletterId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            throw new Error(`Failed to get newsletter: ${response.statusText}`);
        }

        const data: Newsletter = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting newsletter:', error);
        throw error;
    }
}
