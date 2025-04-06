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

  const refreshConfigs = async () => {
    setLoading(true);
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
        
        const mainConfig = configs.find(config => config.main === true);
        if (mainConfig) {
          if (mainConfig.status === "onboarded") {
            mainConfig.status = "ready";
            // Execute mutation: mutation RefreshArticles {
            //  refreshArticles(newsletterUuid: "")
            // }
            await client.graphql({
              query: `
                mutation RefreshArticles($newsletterUuid: String!) {
                  refreshArticles(newsletterUuid: $newsletterUuid)
                }
              `,
            });
          }
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

  useEffect(() => {
    refreshConfigs();
  }, []);

  return { mainNewsletter, loading, error, allConfigs, refreshConfigs };
}; 