import { GraphQLResult } from '@aws-amplify/api-graphql';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { useEffect, useState } from 'react';
import { GET_DEFAULT_NEWSLETTER_CONFIG, GET_NEWSLETTER_CONFIGS, REFRESH_NEWSLETTER } from '../graphql/newsletterConfig.queries';

const client = generateClient();

/**
 * Returns the difference in hours between two Date objects.
 */
function getDiffHours(now: Date, lastRefresh: Date): number {
    return (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60);
}

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

export const useNewsletterConfig = () => {
    const [mainNewsletter, setMainNewsletter] = useState<DefaultNewsletterConfig>();
    const [newsletterUuid, setNewsletterUuid] = useState<string>();
    const [status, setStatus] = useState<string | null>(null);
    const [refreshMode, setRefreshMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [refreshJobId, setRefreshJobId] = useState<string | null>(null);

    const setMainConfig = async () => {
        try {
            setLoading(true);
            const defaultNewsletterConfigResponse = await client.graphql({
                query: GET_DEFAULT_NEWSLETTER_CONFIG
            }) as GraphQLResult<GetDefaultNewsletterConfigResponse>;
            if (!defaultNewsletterConfigResponse.data?.getDefaultNewsletterConfig) {
                throw new Error("Something went wrong");
            }
            const defaultNewsletterConfig = defaultNewsletterConfigResponse.data.getDefaultNewsletterConfig;

            console.log("defaultNewsletterConfig", defaultNewsletterConfig);

            if (defaultNewsletterConfig) {
                setMainNewsletter(defaultNewsletterConfig);
                if (defaultNewsletterConfig.status === 'ready') {
                    const newsletterUuid = defaultNewsletterConfig.newsletterUuid;
                    setNewsletterUuid(newsletterUuid);
                    console.log("defaultNewsletterConfig", defaultNewsletterConfig);
                    switch (defaultNewsletterConfig.userProfile) {
                        case 'premium':
                            // check if defaultNewsletterConfig.lastRefresh is older then defaultNewsletterConfig.userProfileConfig.refreshEveryHours
                            const now = new Date();
                            const lastRefresh = new Date(defaultNewsletterConfig.lastRefresh);
                            const diffHours = getDiffHours(now, lastRefresh);
                            console.log("diffHours", diffHours);
                            if (diffHours > (defaultNewsletterConfig.userProfileConfig as PremiumUserProfile).refreshEveryHours) {
                                // launch refresh
                                console.log("launching refresh");
                                const refreshJobId = await refreshNewsletter(newsletterUuid);
                                console.log("refreshJobId", refreshJobId);
                                if (refreshJobId) {
                                    setRefreshJobId(refreshJobId);
                                }
                            } else {
                                console.log("not launching refresh");
                            }
                            break;
                        case 'free':
                            break;
                        default:
                            break;
                    }
                    setStatus('ready');
                } else {
                    setStatus('not_ready');
                }
                setLoading(false);
            } else {
                throw new Error("No main config found");
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred while fetching newsletter configurations'));
        } finally {
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
                    newsletterUuid: newsletterUuid,
                },
            }) as GraphQLResult<{ refreshNewsletter: string }>;
            console.log("REFRESH_NEWSLETTER result", result);
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

    return { mainNewsletter, status, refreshMode, loading, error, refreshMainConfig, refreshNewsletter, newsletterUuid, refreshJobId };
}; 
