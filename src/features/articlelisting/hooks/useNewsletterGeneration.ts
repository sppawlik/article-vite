import { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { GraphQLResult } from '@aws-amplify/api-graphql';

// Create GraphQL client
const client = generateClient();

// Define the response type for the createNewsletter mutation
export interface CreateNewsletterResponse {
  createNewsletter: {
    newsletter_uuid: string;
  }
}

export const useNewsletterGeneration = (selectedArticles: string[]) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const generateNewsletter = async () => {
    if (selectedArticles.length === 0) return;
    
    setIsGenerating(true);
    
    try {
      // Create config array from selectedArticles
      const config = selectedArticles.map(url => ({
        url,
        summary_config: { size: "medium" }
      }));
      
      // Execute the createNewsletter mutation
      const result = await client.graphql<CreateNewsletterResponse>({
        query: `
          mutation CreateNewsletter($config: [NewsletterConfigInput!]!) {
            createNewsletter(config: $config) {
              newsletter_uuid
            }
          }
        `,
        variables: {
          config
        }
      }) as GraphQLResult<CreateNewsletterResponse>;
      
      const newsletterUuid = result.data?.createNewsletter?.newsletter_uuid;
      console.log('Newsletter created:', newsletterUuid);
      
      // Open a new browser tab with the newsletter UUID
      if (newsletterUuid) {
        // You can customize the URL format based on your application's routing
        const newsletterUrl = `/newsletter/${newsletterUuid}`;
        window.open(newsletterUrl, '_blank');
      }
      
    } catch (err) {
      console.error('Error creating newsletter:', err);
      // Here you could add error handling logic
    } finally {
      setIsGenerating(false);
    }
  };

  return { isGenerating, generateNewsletter };
}; 