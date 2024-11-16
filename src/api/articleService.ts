import type {Schema} from '../../amplify/data/resource'
import {generateClient} from 'aws-amplify/data'
import { GraphQLResult } from '@aws-amplify/api-graphql'

const client = generateClient<Schema>()

export interface UserArticle {
    source: string
    link: string
    title: string
    summary: string
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
        summary: string
        title: string
        url: string
        score: Score
    }[]
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
        link: item?.link ?? '',
        title: item?.title ?? '',
        summary: item?.summary ?? '',
        relativeDate: getRelativeTime(new Date(item?.publishedDate ?? ''), new Date()),
        publishedDate: new Date(item?.publishedDate ?? ''),
        score: item?.score,
        rating: item?.score?.rating / 10
    }));
}

// export async function getArticles(): Promise<UserArticle[]> {
//     try {
//         const response = await fetch(API_URL);
//
//         if (!response.ok) {
//             console.error(`HTTP error! status: ${response.status}`);
//             return [];
//         }
//         const data: APIArticle[] = await response.json();
//         console.log('Size:', data.length);
//         const dataEnhanced: APIArticleEnhanced[] = data.map((item: APIArticle) => ({
//             ...item, publishedDate: new Date(item.PublishedDate)
//         })).sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
//
//
//         return dataEnhanced.map((item: APIArticleEnhanced) => ({
//             source: item.Source,
//             link: item.ArticleId,
//             title: item.Title,
//             summary: item.Summary,
//             relativeDate: getRelativeTime(new Date(item.PublishedDate), new Date()),
//             publishedDate: item.publishedDate,
//             score: item.Score,
//             rating: item.Score.rating / 10,
//         }));
//     } catch (error) {
//         console.error('Error fetching articles:', error);
//         return [];
//     }
// }

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
