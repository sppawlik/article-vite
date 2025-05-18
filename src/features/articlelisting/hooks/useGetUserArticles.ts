import { GraphQLResult } from "@aws-amplify/api-graphql";
import { generateClient } from "aws-amplify/data";
import { useEffect, useState } from "react";
import { Article } from '../../userarticlestable/types';

const client = generateClient();

interface GetUserArticlesResponse {
  getUserArticles: Article[];
}

interface RefreshProgress {
  inProgress: boolean;
  lastRefresh: string;
  totalArticles: number;
  finishedArticles: number;
}

export const useGetUserArticles = (newsletterUuid: string, refreshMode: boolean, age: number = 1000) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Fetch refresh progress from GraphQL
  const fetchRefreshProgress = async (newsletterUuid: string) => {
    try {
      const result = await client.graphql({
        query: `query GetRefreshProgress($newsletterUuid: String!) { 
          getRefreshProgress(newsletterUuid: $newsletterUuid) { 
            inProgress 
            lastRefresh
            totalArticles
            finishedArticles
          } 
        }`,
        variables: { newsletterUuid },
      }) as GraphQLResult<{ getRefreshProgress: RefreshProgress }>;
      console.log("result.data?.getRefreshProgress", result.data?.getRefreshProgress)
      if (result.data?.getRefreshProgress) {
        const refreshData = result.data.getRefreshProgress;
        setRefreshing(refreshData.inProgress);
        
        // Calculate progress percentage
        if (refreshData.totalArticles > 0) {
          const progressPercentage = Math.round((refreshData.finishedArticles / refreshData.totalArticles) * 100);
          setProgress(progressPercentage);
        }
      }
    } catch (err) {
      // fallback: do not update refreshing on error
    }
  };

  useEffect(() => {
    // Always check refresh progress before fetching articles
    fetchRefreshProgress(newsletterUuid);
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
          setArticles(result.data.getUserArticles);
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
      intervalId = setInterval(() => {
        fetchRefreshProgress(newsletterUuid);
        fetchArticles();
      }, 5000); // 5000ms = 5 seconds
    }

    // Cleanup function to clear the interval when component unmounts
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [newsletterUuid, age, refreshing]);

  return { articles, loading, error, progress, refreshing };
}; 