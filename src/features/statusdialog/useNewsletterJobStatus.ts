import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { GraphQLResult } from '@aws-amplify/api-graphql';

// Create GraphQL client
const client = generateClient();

interface ArticleSummary {
  status: string;
  url: string;
}

interface NewsletterJobStatus {
  status: string;
  articleSummaries: ArticleSummary[];
}

interface GetNewsletterJobStatusResponse {
  getNewsletterJobStatus: NewsletterJobStatus;
}

/**
 * Custom hook to handle newsletter job status polling
 * @param jobUuid The UUID of the job to track
 * @returns Job status information and helper functions
 */
export const useNewsletterJobStatus = (jobUuid: string | null) => {
  const [jobStatus, setJobStatus] = useState<NewsletterJobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);

  useEffect(() => {
    if (jobUuid) {
      // Reset state when a new job starts
      setJobStatus(null);
      setError(null);
      setIsPolling(true);
      
      // Start polling for job status
      const intervalId = setInterval(async () => {
        try {
          const result = await client.graphql<GetNewsletterJobStatusResponse>({
            query: `
              query GetNewsletterJobStatus($jobUuid: String!) {
                getNewsletterJobStatus(jobUuid: $jobUuid) {
                  status
                  articleSummaries {
                    status
                    url
                  }
                }
              }
            `,
            variables: {
              jobUuid,
            },
          }) as GraphQLResult<GetNewsletterJobStatusResponse>;

          const status = result.data?.getNewsletterJobStatus;
          
          if (status) {
            setJobStatus(status);
            
            // If job is completed, stop polling
            if (status.status === 'completed') {
              clearInterval(intervalId);
              setIsPolling(false);
            }
          }
        } catch (err) {
          console.error('Error fetching job status:', err);
          setError('Failed to fetch job status. Please try again later.');
          clearInterval(intervalId);
          setIsPolling(false);
        }
      }, 2000); // Poll every 2 seconds

      // Clean up interval on unmount
      return () => {
        clearInterval(intervalId);
        setIsPolling(false);
      };
    }
  }, [jobUuid]);

  // Helper functions for status text and progress
  const getStatusText = () => {
    if (!jobStatus) return 'Initializing...';
    
    switch (jobStatus.status) {
      case 'summarization':
        return 'Summarizing articles...';
      case 'compilation':
        return 'Compiling newsletter...';
      case 'completed':
        return 'Newsletter generation completed!';
      default:
        return `Current status: ${jobStatus.status}`;
    }
  };

  const getProgressPercentage = () => {
    if (!jobStatus) return 0;
    if (jobStatus.status === 'completed') return 100;
    
    if (jobStatus.status === 'summarization' && jobStatus.articleSummaries.length > 0) {
      const completedArticles = jobStatus.articleSummaries.filter(
        article => article.status === 'completed'
      ).length;
      
      return Math.round((completedArticles / jobStatus.articleSummaries.length) * 50);
    }
    
    if (jobStatus.status === 'compilation') return 75;
    
    return 10; // Default progress for initialization
  };

  return {
    jobStatus,
    error,
    isPolling,
    getStatusText,
    getProgressPercentage
  };
}; 