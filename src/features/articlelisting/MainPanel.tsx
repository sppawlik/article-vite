import React from 'react';
import { Loader2 } from "lucide-react";
import { useNewsletterConfig } from './hooks/useNewsletterConfig';
import { MainNewsletterArticles } from './MainNewsletterArticles';
import Onboarding from '../onboarding/Onboarding';

type MainPanelProps = {
  // Add any props if needed in the future
};

export function MainPanel(): React.ReactElement {
  const { mainNewsletterUuid, loading, error } = useNewsletterConfig();

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
        {error.message}
      </div>
    );
  }

  if (!mainNewsletterUuid) {
    return <Onboarding />;
  }

  return (
    <MainNewsletterArticles newsletterUuid={mainNewsletterUuid} />
  );
}
