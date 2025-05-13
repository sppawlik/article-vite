import { GraphQLResult } from "@aws-amplify/api-graphql";
import { generateClient } from "aws-amplify/data";
import { useEffect, useState } from "react";
import { Article } from '../types';

const client = generateClient();

interface GetUserArticlesResponse {
  getUserArticles: Article[];
}

export const useGetUserArticles = (newsletterUuid: string, refreshMode: boolean, age: number = 1000) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(refreshMode);


  useEffect(() => {
    console.log("fetching articles");
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
          // Check if the first article is older than 5 minutes

          
          setArticles(result.data.getUserArticles);
          setProgress(Math.round(result.data.getUserArticles.length/2));
          if (result.data.getUserArticles.length >= 200) {
            setRefreshing(false);
          }
          if (result.data.getUserArticles.length > 0) {
            const now = new Date();
            const articleCreatedAt = new Date(result.data.getUserArticles[0].createdAt);
            const fiveMinutesInMs = 10 * 60 * 1000; // 5 minutes in milliseconds
            const isOlderThanFiveMinutes = now.getTime() - articleCreatedAt.getTime() > fiveMinutesInMs;
            console.log(articleCreatedAt)
            console.log(isOlderThanFiveMinutes)
            if (isOlderThanFiveMinutes) {
              console.log("First article is older than 10 minutes");
              setRefreshing(false)
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchArticles();

    let intervalId: NodeJS.Timeout;
    // Set up interval for periodic refresh
    if (refreshing) {
      intervalId = setInterval(fetchArticles, 5000); // 5000ms = 5 seconds
    }

    // Cleanup function to clear the interval when component unmounts
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [newsletterUuid, age, refreshing]);

  return { articles, loading, error, progress, refreshing };
}; 
