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
    createdAt: Date;
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

interface ListCurrentUserArticlesResponse {
    listCurrentUserArticles: UserArticle[];
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

interface RatedArticle {
    newsletterUuid: string;
    publishedDate: string;
    rating: number;
    relevance: number;
    siteName: string;
    summary: string;
    title: string;
    url: string;
}

interface GetRatedArticlesResponse {
    getRatedArticles: RatedArticle[];
}

interface AddCustomUrlResponse {
  addCustomUrl: {
    createdAt: string;
    depth: number;
    newsletterUuid: string;
    publishedDate: string;
    rating: number;
    siteName: string;
    relevance: number;
    title: string;
    summary: string;
    url: string;
  };
}

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
            createdAt
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
        createdAt: new Date(getUserArticle?.createdAt ?? ""),
        score: getUserArticle?.score,
        rating: getUserArticle.score?.rating / 10,
    };
}

export async function listCurrentUserArticles(startDate: Date): Promise<UserArticle[]> {
    const result = (await client.graphql({
        query: `
        query ListCurrentUserArticles($startDate: String!) {
          listCurrentUserArticles(input: {startDate: $startDate}) {
              link
                    owner
                    createdAt
                    publishedDate
                    hostDomain
                    summary
                    title
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
            startDate: startDate.toISOString().split('T')[0],
        }
    })) as GraphQLResult<ListCurrentUserArticlesResponse>;
    const articles = result.data;
    if (!articles?.listCurrentUserArticles) return [];

    return articles.listCurrentUserArticles.map((item) => ({
        hostDomain: item?.hostDomain ?? "",
        link: item?.link ?? "",
        title: item?.title ?? "",
        summary: item?.summary ?? "",
        relativeDate: getRelativeTime(
            new Date(item?.publishedDate ?? ""),
            new Date()
        ),
        publishedDate: new Date(item?.publishedDate ?? ""),
        createdAt: new Date(item?.createdAt ?? ""),
        score: item?.score,
        rating: item?.score?.rating / 10,
    }));
}


export async function listUserArticles(startDate: Date): Promise<UserArticle[]> {
    const result = (await client.graphql({
        query: `
        query ListUserArticles($startDate: String!) {
          listUserArticles(input: {startDate: $startDate}) {
            items {
              link
                    owner
                    createdAt
                    publishedDate
                    hostDomain
                    summary
                    title
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
            new Date(item?.createdAt ?? ""),
            new Date()
        ),
        publishedDate: new Date(item?.createdAt ?? ""),
        createdAt: new Date(item?.createdAt ?? ""),
        score: item?.score,
        rating: item?.score?.rating / 10,
    }));
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

export async function getRatedArticles(newsletterUuid: string): Promise<RatedArticle[]> {
    try {
        const result = (await client.graphql({
            query: `
                query GetRatedArticles($newsletterUuid: String!) {
                    getRatedArticles(newsletterUuid: $newsletterUuid) {
                        newsletterUuid
                        publishedDate
                        rating
                        relevance
                        siteName
                        summary
                        title
                        url
                    }
                }
            `,
            variables: {
                newsletterUuid
            }
        })) as GraphQLResult<GetRatedArticlesResponse>;

        return result.data?.getRatedArticles ?? [];
    } catch (error) {
        console.error("Error fetching rated articles:", error);
        throw error;
    }
}

export async function addCustomUrl(url: string, newsletterUuid: string) {
  try {
    const response = (await client.graphql({
      query: `
        mutation AddCustomUrl($url: String!, $newsletterUuid: String!) {
          addCustomUrl(
            url: $url,
            newsletterUuid: $newsletterUuid
          ) {
            createdAt
            depth
            newsletterUuid
            publishedDate
            rating
            siteName
            relevance
            title
            summary
            url
          }
        }
      `,
      variables: {
        url,
        newsletterUuid,
      },
    })) as GraphQLResult<AddCustomUrlResponse>;

    return response.data.addCustomUrl;
  } catch (error) {
    console.error("Error adding custom URL:", error);
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
