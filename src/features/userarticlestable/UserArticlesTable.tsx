import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useGetUserArticles } from './hooks/useGetUserArticles';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";

interface UserArticlesTableProps {
  newsletterUuid: string;
  age: number;
  onSelectedArticlesChange?: (selectedArticles: string[]) => void;
}

const getRelativeTime = (dateString: string | undefined, fallbackDate: string): string => {
  const date = dateString ? new Date(dateString) : new Date(fallbackDate);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = [
    { label: "y", seconds: 365 * 24 * 60 * 60 },
    { label: "m", seconds: 30 * 24 * 60 * 60 },
    { label: "d", seconds: 24 * 60 * 60 },
    { label: "h", seconds: 60 * 60 },
    { label: "m", seconds: 60 },
    { label: "s", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count}${interval.label}`;
    }
  }
  return "just now";
};

// Memoized table row component to prevent unnecessary re-renders
const ArticleRow = React.memo(({ 
  article, 
  isSelected, 
  onToggleSelection 
}: { 
  article: any, 
  isSelected: boolean, 
  onToggleSelection: (url: string) => void 
}) => {
  const handleToggle = useCallback(() => {
    onToggleSelection(article.url);
  }, [article.url, onToggleSelection]);

  return (
    <TableRow key={article.url}>
      <TableCell className="text-center">
        <Button
          variant={isSelected ? "default" : "outline"}
          size="sm"
          onClick={handleToggle}
          aria-label={`${isSelected ? "Remove from" : "Add to"} summary list: ${article.title}`}
          className="h-6 w-6 p-0"
        >
        </Button>
      </TableCell>
      <TableCell className="text-left">{article.siteName}</TableCell>
      <TableCell className="font-medium text-left">
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {article.title}
        </a>
        <div className="text-sm text-muted-foreground mt-2">
          {article.summary}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span>{(article.rating / 10).toFixed(1)}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Relevance: {(article.relevance / 10).toFixed(1)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className="text-right">{getRelativeTime(article.publishedDate, article.createdAt)}</TableCell>
    </TableRow>
  );
});

ArticleRow.displayName = 'ArticleRow';

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
