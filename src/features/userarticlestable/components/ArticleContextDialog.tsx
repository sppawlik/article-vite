import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Article } from '../types';

interface ArticleContextDialogProps {
  article: Article;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string, context: string, length: 'short' | 'medium' | 'long') => void;
}

export function ArticleContextDialog({
  article,
  isOpen,
  onClose,
  onConfirm
}: ArticleContextDialogProps) {
  const [context, setContext] = useState('');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');

  const handleConfirm = () => {
    onConfirm(article.url, context, length);
    setContext(''); // Reset the context after confirming
    setLength('medium'); // Reset the length after confirming
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Summary settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="context" className="font-medium">Context</Label>
            <Textarea
              id="context"
              placeholder="How should this article be featured in the newsletter? Any specific points to highlight?"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="length" className="font-medium">Summary Length</Label>
            <Select value={length} onValueChange={(value: 'short' | 'medium' | 'long') => setLength(value)}>
              <SelectTrigger id="length">
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="long">Long</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 