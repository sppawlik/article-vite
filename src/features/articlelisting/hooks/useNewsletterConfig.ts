import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { GraphQLResult } from '@aws-amplify/api-graphql';
import { useAuthenticator } from '@aws-amplify/ui-react';

const client = generateClient();

interface NewsletterConfig {
  main: boolean;
  name: string;
  uuid: string;
  status: string;
}

interface GetNewsletterConfigsResponse {
  getNewsletterConfigs: NewsletterConfig[];
}

interface CreateNewsletterConfigResponse {
  createNewsletterConfig: NewsletterConfig;
}

export const useNewsletterConfig = () => {
  const [mainNewsletter, setMainNewsletter] = useState<NewsletterConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [allConfigs, setAllConfigs] = useState<NewsletterConfig[]>([]);
  const { user } = useAuthenticator();

  useEffect(() => {
    const fetchNewsletterConfigs = async () => {
      try {
        const result = (await client.graphql({
          query: `
            query GetNewsletterConfigs {
              getNewsletterConfigs {
                uuid
                main
                name
                status
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
            setMainNewsletter(mainConfig);
          }
        } else {
          // create new newsletter config
          const newConfig = await client.graphql({
            query: `
              mutation CreateNewsletterConfig($input: CreateNewsletterConfigInput!) {
                createNewsletterConfig(input: $input) {
                  uuid
                  name
                  main
                  status
                }
              }
            `,
            variables: {
              input: {
                user_name: user?.signInDetails?.loginId,
                main: true,
                name: 'default',
              },
            },
          }) as GraphQLResult<CreateNewsletterConfigResponse>;

          if (newConfig.data?.createNewsletterConfig) {
            setMainNewsletter(newConfig.data.createNewsletterConfig);
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

  return { mainNewsletter, loading, error, allConfigs };
}; 