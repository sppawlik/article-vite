import { useEffect } from 'react';

// Add dataLayer type declaration
declare global {
  interface Window {
    dataLayer: any[];
  }
}

interface PageViewProps {
  pagePath: string;
  pageUrl: string;
  previousPageUrl: string;
  pageTitle: string;
  user: any; // We'll accept any user type since the exact Cognito type is not available
}

export function useDataLayer({ pagePath, pageUrl, previousPageUrl, pageTitle, user }: PageViewProps) {
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'virtual_page_view',
      page_path: pagePath,
      page_url: pageUrl,
      previous_page_url: previousPageUrl,
      page_title: pageTitle,
      user_id: user?.userId,
      user: user
    });
  }, [pagePath, pageUrl, previousPageUrl, pageTitle, user]);
} 