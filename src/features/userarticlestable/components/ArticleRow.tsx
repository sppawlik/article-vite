import React, { useCallback, useState } from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { getRelativeTime } from '../utils/dateUtils';
import { Article } from '../types';
import { ArticleContextDialog } from './ArticleContextDialog';

interface ArticleRowProps {
  article: Article;
  isSelected: boolean;
  onToggleSelection: (url: string, context?: string, length?: 'short' | 'medium' | 'long') => void;
}

/**
 * Memoized table row component to prevent unnecessary re-renders
 */
const ArticleRow = React.memo(({ 
  article, 
  isSelected, 
  onToggleSelection 
}: ArticleRowProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleButtonClick = useCallback(() => {
    if (isSelected) {
      // If already selected, just deselect without showing dialog
      onToggleSelection(article.url);
    } else {
      // If not selected, show the dialog
      setIsDialogOpen(true);
    }
  }, [article.url, isSelected, onToggleSelection]);

  const handleDialogConfirm = useCallback((url: string, context: string, length: 'short' | 'medium' | 'long') => {
    onToggleSelection(url, context, length);
  }, [onToggleSelection]);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  return (
    <>
      <TableRow key={article.url}>
        <TableCell className="text-center">
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={handleButtonClick}
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

      <ArticleContextDialog
        article={article}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleDialogConfirm}
      />
    </>
  );
});

ArticleRow.displayName = 'ArticleRow';

export default ArticleRow; 