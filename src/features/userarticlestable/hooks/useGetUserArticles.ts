import { generateClient } from "aws-amplify/data";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import { useState, useEffect } from "react";

const client = generateClient();

interface UserArticle {
  createdAt: string;
  publishedDate: string;
  rating: number;
  siteName: string;
  summary: string;
  title: string;
  url: string;
  relevance: number;
}

interface GetUserArticlesResponse {
  getUserArticles: UserArticle[];
}

export const useGetUserArticles = (newsletterUuid: string, age: number = 1000) => {
  const [articles, setArticles] = useState<UserArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const result = (await client.graphql({
          query: `
            query GetUserArticles($newsletterUuid: String!, $age: Int!) {
              getUserArticles(newsletterUuid: $newsletterUuid, age: $age) {
                createdAt
                publishedDate
                rating
                siteName
                summary
                title
                url
                relevance
              }
            }
          `,
          variables: {
            newsletterUuid,
            age
          }
        })) as GraphQLResult<GetUserArticlesResponse>;

        if (result.data?.getUserArticles) {
          setArticles(result.data.getUserArticles);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [newsletterUuid, age]);

  return { articles, loading, error };
}; 