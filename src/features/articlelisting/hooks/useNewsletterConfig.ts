import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { GraphQLResult } from '@aws-amplify/api-graphql';

const client = generateClient();

interface NewsletterConfig {
  main: boolean;
  name: string;
  uuid: string;
}

interface GetNewsletterConfigsResponse {
  getNewsletterConfigs: NewsletterConfig[];
}

export const useNewsletterConfig = () => {
  const [mainNewsletterUuid, setMainNewsletterUuid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [allConfigs, setAllConfigs] = useState<NewsletterConfig[]>([]);

  useEffect(() => {
    const fetchNewsletterConfigs = async () => {
      try {
        const result = (await client.graphql({
          query: `
            query GetNewsletterConfigs {
              getNewsletterConfigs {
                main
                name
                uuid
              }
            }
          `,
        })) as GraphQLResult<GetNewsletterConfigsResponse>;

        if (result.data?.getNewsletterConfigs) {
          const configs = result.data.getNewsletterConfigs;
          setAllConfigs(configs);
          
          // Find the main newsletter configuration
          const mainConfig = configs.find(config => config.main === true);
          if (mainConfig) {
            setMainNewsletterUuid(mainConfig.uuid);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred while fetching newsletter configurations'));
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletterConfigs();
  }, []);

  return { mainNewsletterUuid, loading, error, allConfigs };
}; 