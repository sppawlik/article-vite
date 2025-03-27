import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useCustomArticle } from '../hooks/useCustomArticle';

interface AddCustomArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newsletterUuid: string;
  onSuccess?: () => void;
}

export function AddCustomArticleDialog({ 
  open, 
  onOpenChange,
  newsletterUuid,
  onSuccess 
}: AddCustomArticleDialogProps) {
  const [url, setUrl] = useState('');
  const { addArticle, isLoading, error } = useCustomArticle();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addArticle(url, newsletterUuid);
      setUrl('');
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Error is already handled in the hook
      console.error('Error in dialog component:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Custom Article</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="article-url">Article URL</Label>
              <Input
                id="article-url"
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 