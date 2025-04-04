import { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { GraphQLResult } from '@aws-amplify/api-graphql';
import { SelectedArticle } from '../../userarticlestable/types';

// Create GraphQL client
const client = generateClient();

// Define the response type for the createNewsletterJob mutation
export interface CreateNewsletterJobResponse {
  createNewsletterJob: {
    newsletterJobUuid: string;
    status: string;
  }
}

export const useNewsletterGeneration = (selectedArticles: SelectedArticle[]) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const generateNewsletter = async (
    newsletterUuid?: string
  ): Promise<string | null> => {
    if (selectedArticles.length === 0 || !newsletterUuid) return null;
    
    setIsGenerating(true);
    
    try {
      // Create config array from selectedArticles
      const config = selectedArticles.map(article => {
        return {
          url: article.url,
          summaryConfig: {
            context: article.context || "",
            length: article.length || "medium"
          }
        };
      });
      
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
      
      // Instead of setting the job UUID in context, return it
      return newsletterJobUuid || null;
      
    } catch (err) {
      console.error('Error creating newsletter job:', err);
      // Here you could add error handling logic
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { isGenerating, generateNewsletter };
}; 