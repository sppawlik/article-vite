// All newsletter config GraphQL queries and mutations

export const GET_DEFAULT_NEWSLETTER_CONFIG = `
    query GetDefaultNewsletterConfig {
        getDefaultNewsletterConfig {
            name
            status
            newsletterUuid
            lastRefresh
            userProfile
            userProfileConfig {
                __typename
                ... on PremiumUserProfile {
                    refreshEveryHours
                }
                ... on FreeUserProfile {
                    isFreeConfig
                }
            }
        }
    }
`;

export const GET_NEWSLETTER_CONFIGS = `
    query GetNewsletterConfigs {
        getNewsletterConfigs {
            uuid
            main
            name
            status
        }
    }
`;

export const REFRESH_NEWSLETTER = `
    mutation RefreshNewsletter($newsletterUuid: String!) {
        refreshNewsletter(newsletterUuid: $newsletterUuid)
        {
            refreshJobId
        }
    }
`;
