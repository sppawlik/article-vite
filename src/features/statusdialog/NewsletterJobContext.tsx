import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NewsletterJobContextType {
  jobUuid: string | null;
  setJobUuid: (uuid: string | null) => void;
  clearJobUuid: () => void;
}

const NewsletterJobContext = createContext<NewsletterJobContextType | undefined>(undefined);

export const NewsletterJobProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jobUuid, setJobUuid] = useState<string | null>(null);

  const clearJobUuid = () => {
    setJobUuid(null);
  };

  return (
    <NewsletterJobContext.Provider value={{ jobUuid, setJobUuid, clearJobUuid }}>
      {children}
    </NewsletterJobContext.Provider>
  );
};

export const useNewsletterJob = (): NewsletterJobContextType => {
  const context = useContext(NewsletterJobContext);
  if (context === undefined) {
    throw new Error('useNewsletterJob must be used within a NewsletterJobProvider');
  }
  return context;
}; 