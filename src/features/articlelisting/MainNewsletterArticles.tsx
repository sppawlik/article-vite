import React, { useState } from 'react';
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

// Add dataLayer type declaration
declare global {
  interface Window {
    dataLayer: any[];
  }
}

type MainNewsletterArticlesProps = {
  newsletterUuid: string;
};

export function MainNewsletterArticles({ newsletterUuid }: MainNewsletterArticlesProps): React.ReactElement {
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


  useDataLayer({
    pagePath: '/list',
    pageUrl: 'https://newsletter.creoscope.com/list',
    previousPageUrl: 'https://newsletter.creoscope.com/login',
    pageTitle: 'Article listing',
    user: user
  });

  const handleSelectedArticlesChange = (articles: SelectedArticle[]) => {
    setSelectedArticles(articles);
    console.log("Selected articles:", articles);
  };

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
      // Pass the newsletter UUID to the generation function
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
    // Force a refresh by updating the selected age
    // This will trigger the UserArticlesTable to re-fetch data
    setSelectedAge(prevAge => {
      // Toggle and reset to trigger a re-render
      setTimeout(() => setSelectedAge(prevAge), 0);
      return prevAge === 7 ? 8 : 7;
    });
    
    setStatusMessage({
      type: 'success',
      message: 'Article added successfully.'
    });
    
    // Auto-dismiss the success message after 3 seconds
    setTimeout(() => {
      setStatusMessage({ type: null, message: null });
    }, 3000);
  };

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
        newsletterUuid={newsletterUuid} 
        age={selectedAge} 
        onSelectedArticlesChange={handleSelectedArticlesChange}
      />
    </div>
  );
} 