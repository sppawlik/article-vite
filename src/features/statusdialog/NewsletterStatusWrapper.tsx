import React from 'react';
import { NewsletterJobProvider, useNewsletterJob } from './NewsletterJobContext';
import JobNewsletterStatus from './JobNewsletterStatus';

interface NewsletterStatusContentProps {
  children: React.ReactNode;
}

// This component uses the context and renders the status dialog
const NewsletterStatusContent: React.FC<NewsletterStatusContentProps> = ({ children }) => {
  const { jobUuid, clearJobUuid } = useNewsletterJob();

  return (
    <>
      {children}
      <JobNewsletterStatus jobUuid={jobUuid} onClose={clearJobUuid} />
    </>
  );
};

// This is the wrapper component that provides the context
export const NewsletterStatusWrapper: React.FC<NewsletterStatusContentProps> = ({ children }) => {
  return (
    <NewsletterJobProvider>
      <NewsletterStatusContent>{children}</NewsletterStatusContent>
    </NewsletterJobProvider>
  );
};

export default NewsletterStatusWrapper; 