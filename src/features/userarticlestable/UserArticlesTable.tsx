import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useGetUserArticles } from './hooks/useGetUserArticles';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import ArticleRow from './components/ArticleRow';
import { UserArticlesTableProps } from './types';

// Define the structure for storing article selection with context
interface SelectedArticleInfo {
  selected: boolean;
  context?: string;
  length?: 'short' | 'medium' | 'long';
}

export const UserArticlesTable: React.FC<UserArticlesTableProps> = ({ 
  newsletterUuid,
  age,
  onSelectedArticlesChange 
}) => {
  const { articles, loading, error } = useGetUserArticles(newsletterUuid, age);
  const [selectedArticles, setSelectedArticles] = useState<Record<string, SelectedArticleInfo>>({});

  // Memoize the selected articles array to prevent unnecessary recalculations
  const selectedArticlesArray = useMemo(() => {
    return Object.entries(selectedArticles)
      .filter(([_, info]) => info.selected)
      .map(([url, info]) => ({
        url,
        context: info.context || '',
        length: info.length || 'medium'
      }));
  }, [selectedArticles]);

  // Optimize the toggle handler with useCallback
  const handleToggleSelection = useCallback((url: string, context?: string, length?: 'short' | 'medium' | 'long') => {
    setSelectedArticles(prev => {
      const newSelected = { ...prev };
      
      // If the article is already selected
      if (newSelected[url]?.selected) {
        delete newSelected[url];
      } else {
        // Add the article with context if provided
        newSelected[url] = {
          selected: true,
          context: context || '',
          length: length || 'medium'
        };
      }
      
      return newSelected;
    });
  }, []);

  // Call the parent callback when selected articles change
  useEffect(() => {
    if (onSelectedArticlesChange) {
      onSelectedArticlesChange(selectedArticlesArray);
    }
  }, [selectedArticlesArray, onSelectedArticlesChange]);

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
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Site Name</TableHead>
            <TableHead className="text-left">Title and summary</TableHead>
            <TableHead className="text-right">Rating</TableHead>
            <TableHead className="text-right">Age</TableHead>
            <TableHead className="w-[50px]">Summarize</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <ArticleRow 
              key={article.url}
              article={article}
              isSelected={!!selectedArticles[article.url]?.selected}
              onToggleSelection={handleToggleSelection}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
