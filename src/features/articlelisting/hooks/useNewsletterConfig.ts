import { GraphQLResult } from '@aws-amplify/api-graphql';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { useEffect, useState, useRef } from 'react';

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
  const [mainNewsletter, setMainNewsletter] = useState<NewsletterConfig>();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuthenticator();
  const isCreatingNewsletter = useRef(false);

  const setMainConfig = async () => {
    try {
      if (isCreatingNewsletter.current) {
        return;
      }
      
      // Set the flag before creating
      isCreatingNewsletter.current = true;
      setLoading(true);
      
      // Double-check if config still doesn't exist
      const allconfigs = (await client.graphql({
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

      if (!allconfigs.data?.getNewsletterConfigs?.length) {
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
          setStatus('not_ready');
        }
      } else {
        const mainConfig = allconfigs.data?.getNewsletterConfigs.find(config => config.main === true);
        if (mainConfig) {
          setMainNewsletter(mainConfig);
          if (mainConfig.status === 'onboarded') {
            setStatus('not_ready');
          } else {
            setStatus('ready');
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while fetching newsletter configurations'));
    } finally {
      isCreatingNewsletter.current = false;
      setLoading(false);
    }
  };

  const refreshMainConfig = async () => {
    setLoading(true);
    try { 
        await client.graphql({
          query: `
            mutation RefreshArticles($newsletterUuid: String!) {
              refreshArticles(newsletterUuid: $newsletterUuid)
            }
          `,
          variables: {
            newsletterUuid: mainNewsletter?.uuid,
          },
        });
        setStatus('ready');
      }
    catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while fetching newsletter configurations'));
    } finally {
      setLoading(false);
    }
   
  };

  useEffect(() => {
    setMainConfig();
  }, []);

  return { mainNewsletter,status,  loading, error, refreshMainConfig };
}; 