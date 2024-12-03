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
        source: article.Source ?? '',
        hostDomain: article.FeedSourceName ?? '',
        link: article.ArticleId,
        title: article.Title ?? '',
        summary: article.Summary ?? '',
        relativeDate: getRelativeTime(new Date(article.PublishedDate ?? ''), new Date()),
        publishedDate: new Date(article.PublishedDate ?? ''),
        score: article.Score,
        rating: article.Score?.rating / 10
    }));

    // return articles.items.map((item) => ({
    //     source: item?.source ?? '',
    //     hostDomain: item?.hostDomain ?? '',
    //     link: item?.link ?? '',
    //     title: item?.title ?? '',
    //     summary: item?.summary ?? '',
    //     relativeDate: getRelativeTime(new Date(item?.publishedDate ?? ''), new Date()),
    //     publishedDate: new Date(item?.publishedDate ?? ''),
    //     score: item?.score,
    //     rating: item?.score?.rating / 10
    // }));
}

function getRelativeTime(pastDate: Date, currentDate: Date): string {
    const diffInSeconds = Math.floor((currentDate.getTime() - pastDate.getTime()) / 1000);

    const intervals = [
        {label: 'year', seconds: 365 * 24 * 60 * 60},
        {label: 'month', seconds: 30 * 24 * 60 * 60},
        {label: 'day', seconds: 24 * 60 * 60},
        {label: 'hour', seconds: 60 * 60},
        {label: 'minute', seconds: 60},
        {label: 'second', seconds: 1},
    ];

    for (const interval of intervals) {
        const count = Math.floor(diffInSeconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count > 1 ? 's' : ''}`;
        }
    }
    return 'just now';
}
