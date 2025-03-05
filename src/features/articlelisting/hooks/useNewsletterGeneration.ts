import { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { GraphQLResult } from '@aws-amplify/api-graphql';
import { useNewsletterJob } from '@/features/statusdialog/NewsletterJobContext';

// Create GraphQL client
const client = generateClient();

// Define the response type for the createNewsletterJob mutation
export interface CreateNewsletterJobResponse {
  createNewsletterJob: {
    newsletterJobUuid: string;
    status: string;
  }
}

export const useNewsletterGeneration = (selectedArticles: string[]) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { setJobUuid } = useNewsletterJob();

  const generateNewsletter = async (newsletterUuid?: string) => {
    if (selectedArticles.length === 0 || !newsletterUuid) return;
    
    setIsGenerating(true);
    
    try {
      // Create config array from selectedArticles
      const config = selectedArticles.map(url => ({
        url,
        summaryConfig: {
          context: "",
          length: "medium"
        }
      }));
      
      // Execute the createNewsletterJob mutation
      const result = await client.graphql<CreateNewsletterJobResponse>({
        query: `
          mutation CreateNewsletterJob($newsletterUuid: String!, $config: [NewsletterJobArticleInput!]!) {
            createNewsletterJob(
              newsletterUuid: $newsletterUuid,
              config: $config
            ) {
              newsletterJobUuid
              status
            }
          }
        `,
        variables: {
          newsletterUuid,
          config
        }
      }) as GraphQLResult<CreateNewsletterJobResponse>;
      
      const newsletterJobUuid = result.data?.createNewsletterJob?.newsletterJobUuid;
      console.log('Newsletter job created:', newsletterJobUuid);
      
      // Instead of opening a new tab, set the job UUID in the context to show the status dialog
      if (newsletterJobUuid) {
        setJobUuid(newsletterJobUuid);
      }
      
    } catch (err) {
      console.error('Error creating newsletter job:', err);
      // Here you could add error handling logic
    } finally {
      setIsGenerating(false);
    }
  };

  return { isGenerating, generateNewsletter };
}; 