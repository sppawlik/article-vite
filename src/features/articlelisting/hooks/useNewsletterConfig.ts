import { GraphQLResult } from '@aws-amplify/api-graphql';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { useEffect, useState, useRef } from 'react';
import { GET_DEFAULT_NEWSLETTER_CONFIG, GET_NEWSLETTER_CONFIGS, REFRESH_NEWSLETTER } from '../graphql/newsletterConfig.queries';

const client = generateClient();

interface NewsletterConfig {
    main: boolean;
    name: string;
    uuid: string;
    status: string;
}

// TypeScript types for the response
export type UserProfileType = 'premium' | 'free';

interface PremiumUserProfile {
  __typename: 'PremiumUserProfile';
  refreshEveryHours: number;
}

interface FreeUserProfile {
  __typename: 'FreeUserProfile';
  isFreeConfig?: boolean | null;
}

type UserProfileConfig = PremiumUserProfile | FreeUserProfile;

interface DefaultNewsletterConfig {
  name: string;
  status: string;
  newsletterUuid: string;
  lastRefresh: string;
  userProfile: UserProfileType;
  userProfileConfig: UserProfileConfig;
}

interface GetDefaultNewsletterConfigResponse {
  getDefaultNewsletterConfig: DefaultNewsletterConfig;
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
    const [newsletterUuid, setNewsletterUuid] = useState<string>();
    const [status, setStatus] = useState<string | null>(null);
    const [refreshMode, setRefreshMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const {user} = useAuthenticator();
    const [refreshJobId, setRefreshJobId] = useState<string | null>(null);
    const isCreatingNewsletter = useRef(false);

    const setMainConfig = async () => {
        try {
            if (isCreatingNewsletter.current) {
                return;
            }

            // Set the flag before creating
            isCreatingNewsletter.current = true;
            setLoading(true);
            const defaultNewsletterConfigResponse = await client.graphql({
                query: GET_DEFAULT_NEWSLETTER_CONFIG
            }) as GraphQLResult<GetDefaultNewsletterConfigResponse>;
            if (!defaultNewsletterConfigResponse.data?.getDefaultNewsletterConfig) {
                throw new Error("Something went wrong");
            }
            const defaultNewsletterConfig = defaultNewsletterConfigResponse.data.getDefaultNewsletterConfig;
            const newsletterUuid = defaultNewsletterConfig.newsletterUuid;
            setNewsletterUuid(newsletterUuid);
            console.log("defaultNewsletterConfig", defaultNewsletterConfig);
            switch (defaultNewsletterConfig.userProfile) {
                case 'premium':
                    // check if defaultNewsletterConfig.lastRefresh is older then defaultNewsletterConfig.userProfileConfig.refreshEveryHours
                    const now = new Date();
                    const lastRefresh = new Date(defaultNewsletterConfig.lastRefresh);
                    console.log(
                        `Current datetime: ${now.toISOString()}, lastRefresh: ${lastRefresh.toISOString()}`
                    );
                    
                    const diff = now.getTime() - lastRefresh.getTime();
                    const diffHours = diff / (1000 * 60 * 60);
                    console.log("diffHours", diffHours);
                    console.log("refreshEveryHours", (defaultNewsletterConfig.userProfileConfig as PremiumUserProfile).refreshEveryHours);
                    if (diffHours > (defaultNewsletterConfig.userProfileConfig as PremiumUserProfile).refreshEveryHours) {
                        // launch refresh
                        const refreshJobId = await refreshNewsletter(newsletterUuid);
                        if (refreshJobId) {
                            setRefreshJobId(refreshJobId);
                        }
                    }
                    break;
                case 'free':
                    break;
                default:
                    break;
            }
                 
            console.log("defaultNewsletterConfig", defaultNewsletterConfig);
            // Double-check if config still doesn't exist
            const allconfigs = (await client.graphql({
                query: GET_NEWSLETTER_CONFIGS,
            })) as GraphQLResult<GetNewsletterConfigsResponse>;

            console.log("allconfigs", allconfigs);
            // Check if config doesn't exist
            if (!allconfigs.data?.getNewsletterConfigs?.length) {
                throw new Error("Something went wrong");
            }

            // Get default newsletter config

            const mainConfig = allconfigs.data?.getNewsletterConfigs.find(config => config.main === true);
            if (mainConfig) {
                setMainNewsletter(mainConfig);
                setLoading(false);
                console.log("mainConfig", mainConfig);
                if (mainConfig.status === 'ready') {
                    setStatus('ready');
                } else {
                    setStatus('not_ready');
                }
            }else{
              throw new Error("No main config found");
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

    /**
     * Executes the refreshNewsletter mutation for the main newsletter config.
     */
    const refreshNewsletter = async (newsletterUuid: string): Promise<string | null> => {
        setLoading(true);
        setError(null);
        try {
            const result = await client.graphql({
                query: REFRESH_NEWSLETTER,
                variables: {
                    newsletter_uuid: newsletterUuid,
                },
            }) as GraphQLResult<{ refreshNewsletter: string }>;
            if (result.data?.refreshNewsletter) {
                setStatus('refreshing');
                return result.data.refreshNewsletter;
            } else {
                setError(new Error('Failed to refresh newsletter.'));
                return null;
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred while refreshing newsletter.'));
            return null;
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        setMainConfig();
    }, []);

    return {mainNewsletter, status, refreshMode, loading, error, refreshMainConfig, refreshNewsletter, newsletterUuid, refreshJobId};
}; 
