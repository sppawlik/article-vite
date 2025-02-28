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

export const UserArticlesTable: React.FC<UserArticlesTableProps> = ({ 
  newsletterUuid,
  age,
  onSelectedArticlesChange 
}) => {
  const { articles, loading, error } = useGetUserArticles(newsletterUuid, age);
  const [selectedArticles, setSelectedArticles] = useState<Record<string, boolean>>({});

  // Memoize the selected articles array to prevent unnecessary recalculations
  const selectedArticlesArray = useMemo(() => {
    return Object.keys(selectedArticles).filter(url => selectedArticles[url]);
  }, [selectedArticles]);

  // Optimize the toggle handler with useCallback
  const handleToggleSelection = useCallback((url: string) => {
    setSelectedArticles(prev => {
      const newSelected = { ...prev };
      
      // Toggle the selection state
      if (newSelected[url]) {
        delete newSelected[url];
      } else {
        newSelected[url] = true;
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
            <TableHead className="w-[50px]">Summarize</TableHead>
            <TableHead className="text-left">Site Name</TableHead>
            <TableHead className="text-left">Title and summary</TableHead>
            <TableHead className="text-right">Rating</TableHead>
            <TableHead className="text-right">Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <ArticleRow 
              key={article.url}
              article={article}
              isSelected={!!selectedArticles[article.url]}
              onToggleSelection={handleToggleSelection}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
