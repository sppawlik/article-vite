import {generateClient} from "aws-amplify/data";
import {GraphQLResult} from "@aws-amplify/api-graphql";
import {create} from "domain";

const client = generateClient();

export interface UserArticle {
    link: string;
    title: string;
    summary: string;
    hostDomain: string;
    relativeDate: string;
    publishedDate?: Date;
    score: Score;
    rating: number;
}

interface Score {
    depth_and_originality: number;
    quality: number;
    relevance: number;
    rating: number;
    simplified: number;
}

interface ListUserArticlesResponse {
    listUserArticles: {
      items: UserArticle[];
      nextToken?: string;
    };
}

interface Article {
    ArticleId: string;
    Owner: string;
    PublishedDate: string;
    Source: string;
    FeedSourceName: string;
    Summary: string;
    Title: string;
    Score: Score;
}

interface GetArticleResponse {
    getArticle: Article;
}

interface GetUserArticleResponse {
    getUserArticles: UserArticle;
}


interface CreateCustomUrlResponse {
    createCustomUrl: {
        url: string;
    };
}

interface GetCustomUrlResponse {
    getCustomUrl: {
        createdAt: string;
        status: string;
        owner: string;
        updatedAt: string;
        url: string;
    };
}

/*
getUserArticles(link: : string): Promise<UserArticle> {
query GetUserArticles {
  getUserArticles(link: "https://esguniversity.substack.com/p/epa-sending-oregon-millions-for-more") {
    hostDomain
    title
    summary
    url
    link
    publishedDate
  }
}
*/

export async function getUserArticles(link: string): Promise<UserArticle> {
    const result = (await client.graphql({
        query: `
        query GetUserArticles($link: String!) {
          getUserArticles(link: $link) {
            hostDomain
            title
            summary
            url
            link
            publishedDate
            score {
                        depth_and_originality
                        quality
                        rating
                        relevance
                        simplified
                    }
          }
        }
    `,
    variables: {
      link: link
    }
    })) as GraphQLResult<GetUserArticleResponse>;
    const getUserArticle = result.data?.getUserArticles;
    return {
        hostDomain: getUserArticle.hostDomain
            ? getUserArticle.hostDomain.split(" ").slice(0, 2).join(" ")
            : "",
        link: getUserArticle?.link,
        title: getUserArticle?.title ?? "",
        summary: getUserArticle?.summary ?? "",
        relativeDate: getRelativeTime(
            new Date(getUserArticle?.publishedDate ?? ""),
            new Date()
        ),
        publishedDate: new Date(getUserArticle.publishedDate ?? ""),
        score: getUserArticle?.score,
        rating: getUserArticle.score?.rating / 10,
    };
}

export async function listUserArticles(startDate: Date): Promise<UserArticle[]> {
    const result = (await client.graphql({
        query: `
        query ListUserArticles($startDate: String!) {
          listUserArticles(input: {startDate: $startDate}) {
            items {
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
        }
    `,
    variables: {
      startDate: startDate.toISOString(),
    }
    })) as GraphQLResult<ListUserArticlesResponse>;

    const articles = result.data;
    if (!articles?.listUserArticles) return [];
    console.log(articles);

    return articles.listUserArticles.items.map((item) => ({
        hostDomain: item?.hostDomain ?? "",
        link: item?.link ?? "",
        title: item?.title ?? "",
        summary: item?.summary ?? "",
        relativeDate: getRelativeTime(
            new Date(item?.publishedDate ?? ""),
            new Date()
        ),
        publishedDate: new Date(item?.publishedDate ?? ""),
        score: item?.score,
        rating: item?.score?.rating / 10,
    }));
}

function createUserArticle(article: Article): UserArticle {
    return {
        hostDomain: article.FeedSourceName
            ? article.FeedSourceName.split(" ").slice(0, 2).join(" ")
            : "",
        link: article.ArticleId,
        title: article.Title ?? "",
        summary: article.Summary ?? "",
        relativeDate: getRelativeTime(
            new Date(article.PublishedDate ?? ""),
            new Date()
        ),
        publishedDate: new Date(article.PublishedDate ?? ""),
        score: article.Score,
        rating: article.Score?.rating / 10,
    };
}

export async function createCustomUrl(url: string): Promise<string> {
    try {
        const response = (await client.graphql<CreateCustomUrlResponse>({
            query: `
                mutation CreateCustomUrl($url: String!) {
                    createCustomUrl(input: {url: $url}) {
                        url
                    }
                }
            `,
            variables: {
                url,
            },
        })) as GraphQLResult<CreateCustomUrlResponse>;

        return response.data.createCustomUrl.url;
    } catch (error) {
        console.error("Error creating custom URL:", error);
        throw error;
    }
}

export async function getArticle(url: string): Promise<UserArticle> {
    try {
        const response = (await client.graphql({
            query: `
                query GetArticle($url: String!) {
                    getArticle(url: $url) {
                        ArticleId
                        ItemType
                        Owner
                        PublishedDate
                        Score {
                            depth_and_originality
                            quality
                            rating
                            relevance
                            simplified
                        }
                        Source
                        Summary
                        Title
                    }
                }
            `,
            variables: {url},
        })) as GraphQLResult<GetArticleResponse>;
        const article = response.data?.getArticle;
        const userArticle = createUserArticle(article);
        return userArticle;
    } catch (error) {
        console.error("Error fetching custom URL:", error);
        throw error;
    }
}

export async function getCustomUrl(url: string) {
    try {
        const response = (await client.graphql({
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
            variables: {url},
        })) as GraphQLResult<GetCustomUrlResponse>;

        return response.data?.getCustomUrl;
    } catch (error) {
        console.error("Error fetching custom URL:", error);
        throw error;
    }
}

function getRelativeTime(pastDate: Date, currentDate: Date): string {
    const diffInSeconds = Math.floor(
        (currentDate.getTime() - pastDate.getTime()) / 1000
    );

    const intervals = [
        {label: "y", seconds: 365 * 24 * 60 * 60},
        {label: "m", seconds: 30 * 24 * 60 * 60},
        {label: "d", seconds: 24 * 60 * 60},
        {label: "h", seconds: 60 * 60},
        {label: "m", seconds: 60},
        {label: "s", seconds: 1},
    ];

    for (const interval of intervals) {
        const count = Math.floor(diffInSeconds / interval.seconds);
        if (count >= 1) {
            return `${count}${interval.label}`;
        }
    }
    return "just now";
}
