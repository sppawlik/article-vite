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

const createNewsletterConfig = async (userName: string): Promise<NewsletterConfig | undefined> => {
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
        user_name: userName,
        main: true,
        name: 'default',
      },
    },
  }) as GraphQLResult<CreateNewsletterConfigResponse>;
  
  return newConfig.data?.createNewsletterConfig;
};

export const useNewsletterConfig = () => {
  const [mainNewsletter, setMainNewsletter] = useState<NewsletterConfig>();
  const [status, setStatus] = useState<string | null>(null);
  const [refreshMode, setRefreshMode] = useState(false);
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

      // Check if config doesn't exist
      if (!allconfigs.data?.getNewsletterConfigs?.length) {
        // create new newsletter config
        const userName = user?.signInDetails?.loginId;
        if (!userName) {
          throw new Error('User login ID is required to create newsletter config');
        }
        const newConfig = await createNewsletterConfig(userName);
        
        if (newConfig) {
          setMainNewsletter(newConfig);
          setLoading(false);
          setStatus('not_ready');
        }
      } else {
        const mainConfig = allconfigs.data?.getNewsletterConfigs.find(config => config.main === true);
        if (mainConfig) {
          setMainNewsletter(mainConfig);
          setLoading(false);
          if (mainConfig.status === 'ready') {
            setStatus('ready');
          } else {
            setStatus('not_ready');
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while fetching newsletter configurations'));
    } finally {
      isCreatingNewsletter.current = false;
    }
  };

  const refreshMainConfig = async () => {
    setRefreshMode(true);
    setStatus('ready');
  };

  useEffect(() => {
    setMainConfig();
  }, []);

  return { mainNewsletter, status, refreshMode, loading, error, refreshMainConfig };
}; 