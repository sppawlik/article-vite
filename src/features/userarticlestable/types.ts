/**
 * Common types for the user articles feature
 */

export interface Article {
  url: string;
  title: string;
  summary: string;
  siteName: string;
  publishedDate: string;
  createdAt: string;
  rating: number;
  relevance: number;
}

export interface SelectedArticle {
  url: string;
  context: string;
  length: 'short' | 'medium' | 'long';
}

export interface UserArticlesTableProps {
  newsletterUuid: string;
  age: number;
  onSelectedArticlesChange?: (articles: SelectedArticle[]) => void;
} 