import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useNewsletterJobStatus } from './useNewsletterJobStatus';

interface JobNewsletterStatusProps {
  jobUuid: string | null;
  onClose: () => void;
}

export const JobNewsletterStatus: React.FC<JobNewsletterStatusProps> = ({
  jobUuid,
  onClose,
}) => {
  const [open, setOpen] = useState<boolean>(!!jobUuid);
  const { 
    jobStatus, 
    error, 
    getStatusText, 
    getProgressPercentage 
  } = useNewsletterJobStatus(jobUuid);

  useEffect(() => {
    setOpen(!!jobUuid);
  }, [jobUuid]);

  const handleDialogClose = () => {
    setOpen(false);
    onClose();
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