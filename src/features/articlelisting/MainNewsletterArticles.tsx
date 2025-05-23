import React, { useState, useEffect, useCallback } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Loader2, Plus } from "lucide-react";
import { UserArticlesTable } from '../userarticlestable/UserArticlesTable';
import { useNewsletterGeneration } from './hooks/useNewsletterGeneration';
import { TimePeriodSelector } from './components/TimePeriodSelector';
import { Button } from "@/components/ui/button";
import { JobNewsletterStatus } from '@/features/statusdialog/JobNewsletterStatus';
import { SelectedArticle } from '../userarticlestable/types';
import { AddCustomArticleDialog } from './components/AddCustomArticleDialog';
import { useDataLayer } from '@/hooks/useDataLayer';
import { useGetUserArticles } from './hooks/useGetUserArticles';
import { RefreshProgress } from './components/RefreshProgress';

// Add dataLayer type declaration
declare global {
  interface Window {
    dataLayer: any[];
  }
}

type MainNewsletterArticlesProps = {
  newsletterUuid: string;
  refreshMode?: boolean;
};

export function MainNewsletterArticles({ newsletterUuid, refreshMode = false }: MainNewsletterArticlesProps): React.ReactElement {
  const { user } = useAuthenticator();
  const [selectedAge, setSelectedAge] = useState<number>(7); // Default to "1 week"
  const [selectedArticles, setSelectedArticles] = useState<SelectedArticle[]>([]);
  const { isGenerating, generateNewsletter } = useNewsletterGeneration(selectedArticles);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | null; message: string | null }>({ 
    type: null, 
    message: null 
  });
  const [jobUuid, setJobUuid] = useState<string | null>(null);
  const [showAddArticleDialog, setShowAddArticleDialog] = useState(false);
  const { articles, loading, error, progress, refreshing } = useGetUserArticles(newsletterUuid, refreshMode, selectedAge);
  useDataLayer({
    pagePath: '/list',
    pageUrl: 'https://newsletter.creoscope.com/list',
    previousPageUrl: 'https://newsletter.creoscope.com/login',
    pageTitle: 'Article listing',
    user: user
  });

  const handleSelectedArticlesChange = useCallback((articles: SelectedArticle[]) => {
    setSelectedArticles(articles);
    console.log("Selected articles:", articles);
  }, []);

  const handleGenerateNewsletter = async () => {
    if (selectedArticles.length === 0) {
      setStatusMessage({
        type: 'error',
        message: 'Please select at least one article to generate a newsletter.'
      });
      return;
    }
    
    setStatusMessage({ type: null, message: null });
    
    try {
      const newJobUuid = await generateNewsletter(newsletterUuid);
      
      if (newJobUuid) {
        setJobUuid(newJobUuid);
      } else {
        setStatusMessage({
          type: 'error',
          message: 'Failed to generate newsletter. Please try again.'
        });
      }
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'There was an error generating your newsletter. Please try again.'
      });
    }
  };

  const handleJobStatusClose = () => {
    setJobUuid(null);
  };

  const handleAddArticleSuccess = () => {
    setStatusMessage({
      type: 'success',
      message: 'Article added successfully.'
    });
    
    // Auto-dismiss the success message after 3 seconds
    setTimeout(() => {
      setStatusMessage({ type: null, message: null });
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">{error.message}</div>;
  }

  return (
    <div className="space-y-4 min-w-[800px]">
      <JobNewsletterStatus 
        jobUuid={jobUuid} 
        onClose={handleJobStatusClose} 
        user={user}
      />
      
      <AddCustomArticleDialog
        open={showAddArticleDialog}
        onOpenChange={setShowAddArticleDialog}
        newsletterUuid={newsletterUuid}
        onSuccess={handleAddArticleSuccess}
      />
      
      {refreshing && (
        <RefreshProgress progress={progress} />
      )}
      
      <div className="flex justify-between items-center p-4">
        <TimePeriodSelector 
          selectedAge={selectedAge} 
          onAgeChange={setSelectedAge} 
        />
        <div className="flex items-center space-x-4">
          {selectedArticles.length > 0 && (
            <div className="text-sm">
              {selectedArticles.length} article{selectedArticles.length !== 1 ? 's' : ''} selected
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => setShowAddArticleDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add article
          </Button>
          <Button
            variant="outline"
            onClick={handleGenerateNewsletter}
            disabled={selectedArticles.length === 0 || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Newsletter'
            )}
          </Button>
        </div>
      </div>
      
      {statusMessage.message && (
        <div className={`px-4 py-2 rounded-md ${
          statusMessage.type === 'error' 
            ? 'bg-destructive/15 text-destructive' 
            : 'bg-green-100 text-green-800'
        }`}>
          {statusMessage.message}
        </div>
      )}
      
      <UserArticlesTable 
        articles={articles}
        onSelectedArticlesChange={handleSelectedArticlesChange}
      />
    </div>
  );
} 
