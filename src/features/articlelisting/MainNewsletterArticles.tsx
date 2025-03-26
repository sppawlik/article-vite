import React, { useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { LogOut, Loader2, Plus } from "lucide-react";
import { UserArticlesTable } from '../userarticlestable/UserArticlesTable';
import { useNewsletterConfig } from './hooks/useNewsletterConfig';
import { useNewsletterGeneration } from './hooks/useNewsletterGeneration';
import { TimePeriodSelector } from './components/TimePeriodSelector';
import { Button } from "@/components/ui/button";
import { JobNewsletterStatus } from '@/features/statusdialog/JobNewsletterStatus';
import { SelectedArticle } from '../userarticlestable/types';
import { AddCustomArticleDialog } from './components/AddCustomArticleDialog';

export function MainNewsletterArticles() {
  const { user, signOut } = useAuthenticator();
  const { mainNewsletterUuid, loading, error } = useNewsletterConfig();
  const [selectedAge, setSelectedAge] = useState<number>(7); // Default to "1 week"
  const [selectedArticles, setSelectedArticles] = useState<SelectedArticle[]>([]);
  const { isGenerating, generateNewsletter } = useNewsletterGeneration(selectedArticles);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | null; message: string | null }>({ 
    type: null, 
    message: null 
  });
  const [jobUuid, setJobUuid] = useState<string | null>(null);
  const [showAddArticleDialog, setShowAddArticleDialog] = useState(false);

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
    
    if (!mainNewsletterUuid) {
      setStatusMessage({
        type: 'error',
        message: 'No newsletter configuration found. Please try again later.'
      });
      return;
    }
    
    setStatusMessage({ type: null, message: null });
    
    try {
      // Pass only the newsletter UUID to the generation function
      const newJobUuid = await generateNewsletter(mainNewsletterUuid);
      
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
      />
      
      <AddCustomArticleDialog
        open={showAddArticleDialog}
        onOpenChange={setShowAddArticleDialog}
        newsletterUuid={mainNewsletterUuid || ''}
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
            disabled={!mainNewsletterUuid}
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
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              signOut();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <LogOut className="h-5 w-5"/>
            <span className="sr-only">Logout</span>
          </a>
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
      
      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
          {error.message}
        </div>
      ) : mainNewsletterUuid ? (
        <UserArticlesTable 
          newsletterUuid={mainNewsletterUuid} 
          age={selectedAge} 
          onSelectedArticlesChange={handleSelectedArticlesChange}
        />
      ) : (
        <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-md">
          No main newsletter configuration found.
        </div>
      )}
    </div>
  );
} 