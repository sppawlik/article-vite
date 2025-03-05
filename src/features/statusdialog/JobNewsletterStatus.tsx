import React, { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { GraphQLResult } from '@aws-amplify/api-graphql';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// Create GraphQL client
const client = generateClient();

interface ArticleSummary {
  status: string;
  url: string;
}

interface NewsletterJobStatus {
  status: string;
  articleSummaries: ArticleSummary[];
}

interface GetNewsletterJobStatusResponse {
  getNewsletterJobStatus: NewsletterJobStatus;
}

interface JobNewsletterStatusProps {
  jobUuid: string | null;
  onClose: () => void;
}

export const JobNewsletterStatus: React.FC<JobNewsletterStatusProps> = ({
  jobUuid,
  onClose,
}) => {
  const [open, setOpen] = useState<boolean>(!!jobUuid);
  const [jobStatus, setJobStatus] = useState<NewsletterJobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOpen(!!jobUuid);
    if (jobUuid) {
      // Reset state when a new job starts
      setJobStatus(null);
      setError(null);
      
      // Start polling for job status
      const intervalId = setInterval(async () => {
        try {
          const result = await client.graphql<GetNewsletterJobStatusResponse>({
            query: `
              query GetNewsletterJobStatus($jobUuid: String!) {
                getNewsletterJobStatus(jobUuid: $jobUuid) {
                  status
                  articleSummaries {
                    status
                    url
                  }
                }
              }
            `,
            variables: {
              jobUuid,
            },
          }) as GraphQLResult<GetNewsletterJobStatusResponse>;

          const status = result.data?.getNewsletterJobStatus;
          
          if (status) {
            setJobStatus(status);
            
            // If job is completed, stop polling
            if (status.status === 'completed') {
              clearInterval(intervalId);
            }
          }
        } catch (err) {
          console.error('Error fetching job status:', err);
          setError('Failed to fetch job status. Please try again later.');
          clearInterval(intervalId);
        }
      }, 2000); // Poll every 2 seconds

      // Clean up interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [jobUuid]);

  const handleDialogClose = () => {
    setOpen(false);
    onClose();
  };

  const getStatusText = () => {
    if (!jobStatus) return 'Initializing...';
    
    switch (jobStatus.status) {
      case 'summarization':
        return 'Summarizing articles...';
      case 'compilation':
        return 'Compiling newsletter...';
      case 'completed':
        return 'Newsletter generation completed!';
      default:
        return `Current status: ${jobStatus.status}`;
    }
  };

  const getProgressPercentage = () => {
    if (!jobStatus) return 0;
    if (jobStatus.status === 'completed') return 100;
    
    if (jobStatus.status === 'summarization' && jobStatus.articleSummaries.length > 0) {
      const completedArticles = jobStatus.articleSummaries.filter(
        article => article.status === 'completed'
      ).length;
      
      return Math.round((completedArticles / jobStatus.articleSummaries.length) * 50);
    }
    
    if (jobStatus.status === 'compilation') return 75;
    
    return 10; // Default progress for initialization
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Newsletter Generation Status</DialogTitle>
          <DialogDescription>
            {getStatusText()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <>
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              
              {/* Article status list */}
              {jobStatus?.status === 'summarization' && jobStatus.articleSummaries.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Article Summaries:</h4>
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {jobStatus.articleSummaries.map((article, index) => (
                      <li key={index} className="text-sm flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          article.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></span>
                        <span className="truncate flex-1">{article.url}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          {article.status === 'completed' ? 'Done' : 'Processing'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Completed message */}
              {jobStatus?.status === 'completed' && (
                <div className="mt-4 text-center">
                  <p className="text-green-600 font-medium">
                    Newsletter has been successfully generated!
                  </p>
                  <a 
                    href={`/newsletter/${jobUuid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-blue-600 hover:underline"
                  >
                    View Newsletter
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobNewsletterStatus; 