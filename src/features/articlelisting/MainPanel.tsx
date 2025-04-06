import React from 'react';
import { Loader2, LogOut } from "lucide-react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNewsletterConfig } from './hooks/useNewsletterConfig';
import { MainNewsletterArticles } from './MainNewsletterArticles';
import Onboarding from '../onboarding/Onboarding';

const LogoutButton = (): React.ReactElement => {
  const { signOut } = useAuthenticator();
  
  return (
    <div className="absolute right-2">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          signOut();
        }}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 bg-white/80 shadow-sm"
      >
        <LogOut className="h-5 w-5"/>
        <span className="sr-only">Logout</span>
      </a>
    </div>
  );
};

export function MainPanel(): React.ReactElement {
  const { mainNewsletter, loading, error, refreshConfigs } = useNewsletterConfig();
  console.log("mainNewsletter", mainNewsletter);
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
      <div className="pt-8">
        {mainNewsletter?.status === 'ready' ? (
          <MainNewsletterArticles newsletterUuid={mainNewsletter.uuid} />
        ) : (
          <Onboarding 
            newsletterUuid={mainNewsletter?.uuid} 
            onRefreshNewsletter={refreshConfigs}
          />
        )}
      </div>
    </div>
  );
}
