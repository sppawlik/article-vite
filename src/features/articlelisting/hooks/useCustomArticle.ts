import { useState } from 'react';
import { addCustomUrl } from '@/api/articleService';

interface CustomArticleResult {
  createdAt: string;
  depth: number;
  newsletterUuid: string;
  publishedDate: string;
  rating: number;
  siteName: string;
  relevance: number;
  title: string;
  summary: string;
  url: string;
}

interface UseCustomArticleResult {
  addArticle: (url: string, newsletterUuid: string) => Promise<CustomArticleResult | undefined>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export const useCustomArticle = (): UseCustomArticleResult => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setError(null);
  };

  const addArticle = async (url: string, newsletterUuid: string): Promise<CustomArticleResult | undefined> => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await addCustomUrl(url, newsletterUuid);
      console.log('Article added successfully:', result);
      return result;
    } catch (err) {
      setError('Failed to add article. Please try again.');
      console.error('Error adding custom URL:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { addArticle, isLoading, error, reset };
}; 