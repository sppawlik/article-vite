import React from 'react';
import { Loader2 } from "lucide-react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNewsletterConfig } from './hooks/useNewsletterConfig';
import { MainNewsletterArticles } from './MainNewsletterArticles';
import Onboarding from '../onboarding/Onboarding';
import LogoutButton from './components/LogoutButton';

export function MainPanel(): React.ReactElement {
  const { mainNewsletter, status, refreshMode, loading, error, refreshMainConfig, newsletterUuid, refreshJobId } = useNewsletterConfig();
  // Show loading spinner when loading
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Show error message when there's an error
  if (error) {
    return (
      <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
        {error.message}
      </div>
    );
  }
  
  return (
    <div className="relative">
      <LogoutButton />
      {mainNewsletter && status ? (
        <div className="pt-8">
          {status === 'ready' ? (
            <MainNewsletterArticles newsletterUuid={mainNewsletter.newsletterUuid} refreshMode={true} />
          ) : (
            <Onboarding 
              newsletterUuid={mainNewsletter.newsletterUuid} 
              onRefreshNewsletter={refreshMainConfig}
            />
          )}
        </div>
      ) : <div>ERROR</div>}
    </div>
  );
}
