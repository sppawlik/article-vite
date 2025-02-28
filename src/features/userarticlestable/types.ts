/**
 * Common types for the user articles feature
 */

export interface Article {
  url: string;
  siteName: string;
  title: string;
  summary: string;
  rating: number;
  relevance: number;
  publishedDate?: string;
  createdAt: string;
}

export interface UserArticlesTableProps {
  newsletterUuid: string;
  age: number;
  onSelectedArticlesChange?: (selectedArticles: string[]) => void;
} 