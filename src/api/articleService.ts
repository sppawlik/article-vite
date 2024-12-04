import {generateClient} from 'aws-amplify/data'
import { GraphQLResult } from '@aws-amplify/api-graphql'

const client = generateClient()

export interface UserArticle {
    source: string
    link: string
    title: string
    summary: string
    hostDomain:string
    relativeDate: string
    publishedDate?: Date
    score: Score
    rating: number
}

interface Score {
    depth_and_originality: number
    quality: number
    relevance: number
    rating: number
    simplified: number
}

interface ListUserArticlesResponse {
    listUserArticles: {
        link: string
        owner: string
        publishedDate: string
        source: string
        hostDomain: string
        summary: string
        title: string
        url: string
        score: Score
    }[]
}

interface ListArticleResponse {
    getArticle: {
        link: string
        owner: string
        publishedDate: string
        source: string
        hostDomain: string
        summary: string
        title: string
        url: string
        score: Score
    }
}

interface ListArticlesResponse {
    listArticles: {
        nextToken?: string
        items: {
            ArticleId: string
            Owner: string
            PublishedDate: string
            Source: string
            FeedSourceName: string
            Summary: string
            Title: string
            Score: Score
        }[]
    }
}

interface CreateCustomUrlResponse {
    createCustomUrl: {
        url: string
    }
}

interface GetCustomUrlResponse {
    getCustomUrl: {
        createdAt: string
        status: string
        owner: string
        updatedAt: string
        url: string
    }
}

export async function getUserArticles(): Promise<UserArticle[]> {
    const result = await client.graphql({
        query: `
            query ListUserArticles {
                listUserArticles {
                    link
                    owner
                    publishedDate
                    source
                    hostDomain
                    summary
                    title
                    url
                    score {
                        depth_and_originality
                        quality
                        rating
                        relevance
                        simplified
                    }
                }
            }
        `
    }) as GraphQLResult<ListUserArticlesResponse>

    const articles = result.data
    if (!articles?.listUserArticles) return []
    console.log(articles)

    return articles.listUserArticles.map((item) => ({
        source: item?.source ?? '',
        hostDomain: item?.hostDomain ?? '',
        link: item?.link ?? '',
        title: item?.title ?? '',
        summary: item?.summary ?? '',
        relativeDate: getRelativeTime(new Date(item?.publishedDate ?? ''), new Date()),
        publishedDate: new Date(item?.publishedDate ?? ''),
        score: item?.score,
        rating: item?.score?.rating / 10
    }));
}

export async function listArticle(startDate: Date): Promise<UserArticle[]> {
    const result = await client.graphql({
        query: `
            query ListArticles($startDate: String!) {
                listArticles(input: { startDate: $startDate}) {
                    nextToken
                    items {
                        ArticleId
                        Owner
                        PublishedDate
                        Source
                        FeedSourceName
                        Summary
                        Title
                        Score {
                            depth_and_originality
                            quality
                            rating
                            relevance
                            simplified
                        }
                    }
                }
            }
        `,
        variables: {
            startDate: startDate.toISOString()
        }
    }) as GraphQLResult<ListArticlesResponse>

    const articles = result.data?.listArticles
    if (!articles) return []

    return articles.items.map((article) => ({
        source: article.Source?.length > 10 ? article.Source.split('.').slice(0,2).reduce((a,b) => a.length > b.length ? a : b) : article.Source,
        hostDomain: article.FeedSourceName ? article.FeedSourceName.split(' ').slice(0, 2).join(' ') : '',
        link: article.ArticleId,
        title: article.Title ?? '',
        summary: article.Summary ?? '',
        relativeDate: getRelativeTime(new Date(article.PublishedDate ?? ''), new Date()),
        publishedDate: new Date(article.PublishedDate ?? ''),
        score: article.Score,
        rating: article.Score?.rating / 10
    }));

}

export async function createCustomUrl(url: string): Promise<string> {
    try {
        const response = await client.graphql<CreateCustomUrlResponse>({
            query: `
                mutation CreateCustomUrl($url: String!) {
                    createCustomUrl(input: {url: $url}) {
                        url
                    }
                }
            `,
            variables: {
                url
            }
        }) as GraphQLResult<CreateCustomUrlResponse>
        
        return response.data.createCustomUrl.url
    } catch (error) {
        console.error('Error creating custom URL:', error)
        throw error
    }
}

export async function getCustomUrl(url: string) {
    try {
        const response = await client.graphql({
            query: `
                query GetCustomUrl($url: String!) {
                    getCustomUrl(url: $url) {
                        createdAt
                        status
                        owner
                        updatedAt
                        url
                    }
                }
            `,
            variables: { url }
        }) as GraphQLResult<GetCustomUrlResponse>

        return response.data?.getCustomUrl
    } catch (error) {
        console.error('Error fetching custom URL:', error)
        throw error
    }
}

function getRelativeTime(pastDate: Date, currentDate: Date): string {
    const diffInSeconds = Math.floor((currentDate.getTime() - pastDate.getTime()) / 1000);

    const intervals = [
        {label: 'y', seconds: 365 * 24 * 60 * 60},
        {label: 'm', seconds: 30 * 24 * 60 * 60},
        {label: 'd', seconds: 24 * 60 * 60},
        {label: 'h', seconds: 60 * 60},
        {label: 'm', seconds: 60},
        {label: 's', seconds: 1},
    ];

    for (const interval of intervals) {
        const count = Math.floor(diffInSeconds / interval.seconds);
        if (count >= 1) {
            return `${count}${interval.label}`;
        }
    }
    return 'just now';
}
