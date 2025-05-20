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

// Helper function to encapsulate premium user auto-refresh logic
const _handlePremiumUserAutoRefresh = async (
    configData: DefaultNewsletterConfig,
    currentNewsletterUuid: string,
    // Pass functions from the hook's scope
    doRefreshNewsletter: (uuid: string) => Promise<string | null>,
) => {
    // Ensure we have the correct user profile and config type
    if (configData.userProfile === 'premium' && configData.userProfileConfig?.__typename === 'PremiumUserProfile') {
        const premiumConfig = configData.userProfileConfig as PremiumUserProfile; // Safe to cast here after check
        const now = new Date();
        const lastRefresh = new Date(configData.lastRefresh);
        const diffHours = getDiffHours(now, lastRefresh);

        if (diffHours > premiumConfig.refreshEveryHours) {
            console.log(`Premium user data is ${diffHours.toFixed(1)} hours old (threshold: ${premiumConfig.refreshEveryHours}h). Triggering auto-refresh for UUID: ${currentNewsletterUuid}.`);
            const jobId = await doRefreshNewsletter(currentNewsletterUuid);
            if (jobId) {
                console.log("Auto-refresh for premium user initiated, job ID:", jobId);
            } else {
                console.error("Auto-refresh mutation call for premium user failed to return a job ID.");
            }
        } else {
            console.log(`Premium user data is ${diffHours.toFixed(1)} hours old (threshold: ${premiumConfig.refreshEveryHours}h). No auto-refresh needed for UUID: ${currentNewsletterUuid}.`);
        }
    }
};

export const useNewsletterConfig = () => {
    const [mainNewsletter, setMainNewsletter] = useState<DefaultNewsletterConfig>();
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const setMainConfig = async () => {
        try {
            setLoading(true);
            setError(null); // Reset error at the beginning
            console.log("Status before fetching default newsletter config:", status);
            const defaultNewsletterConfigResponse = await client.graphql({
                query: GET_DEFAULT_NEWSLETTER_CONFIG
            }) as GraphQLResult<GetDefaultNewsletterConfigResponse>;
            if (!defaultNewsletterConfigResponse.data?.getDefaultNewsletterConfig) {
                throw new Error("Failed to retrieve default newsletter configuration from API.");
            }
            const fetchedConfig = defaultNewsletterConfigResponse.data.getDefaultNewsletterConfig;

            console.log("Fetched defaultNewsletterConfig:", fetchedConfig);
            
            setMainNewsletter(fetchedConfig);

            if (fetchedConfig.status === 'ready') {
                const currentUuid = fetchedConfig.newsletterUuid;
                
                // Handle auto-refresh logic for premium users
                await _handlePremiumUserAutoRefresh(
                    fetchedConfig,
                    currentUuid,
                    refreshNewsletter, // Pass the hook's refreshNewsletter function
                );
                // The original switch statement only had logic for 'premium', which is now handled above.
                // 'free' and 'default' cases were no-ops.

                setStatus('ready');
            } else {
                setStatus('not_ready');
            }
        } catch (err) {
            console.error("Error in setMainConfig:", err);
            setError(err instanceof Error ? err : new Error('An error occurred while fetching newsletter configurations'));
            setStatus('error'); // Set status to error
        } finally {
            setLoading(false); // Ensure loading is always set to false
        }
    };

    const refreshMainConfig = async () => {
        setStatus('ready');
        console.log("refreshMainConfig", mainNewsletter);
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
                return result.data.refreshNewsletter;
            } else {
                setError(new Error('Failed to refresh newsletter. No job ID returned.'));
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
        console.log("useEffect");
        setMainConfig();
    }, []);

    return { mainNewsletter, status, loading, error, refreshMainConfig, refreshNewsletter };
}; 
