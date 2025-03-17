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

  const truncateText = (text: string, maxLength: number = 400): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  const handleRowClick = useCallback((e: React.MouseEvent) => {
    window.open(article.url, '_blank', 'noopener,noreferrer');
  }, [article.url]);

  const handleCellClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click when clicking the button cell
  }, []);

  return (
    <>
      <TableRow 
        key={article.url} 
        onClick={handleRowClick}
        className="cursor-pointer hover:bg-muted/50"
      >
        <TableCell className="text-center" onClick={handleCellClick}>
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
          {article.title}
          <span className="text-sm text-muted-foreground ml-2">
            {truncateText(article.summary)}
          </span>
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