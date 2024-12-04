import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCustomUrl, getCustomUrl } from "@/api/articleService";
import { Loader2 } from "lucide-react";

interface AddArticleDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddArticleDialog({ isOpen, onClose }: AddArticleDialogProps) {
    const [newArticleUrl, setNewArticleUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSave = async () => {
        if (!newArticleUrl) return;
        setIsSaving(true);
        setErrorMessage(null);
        try {
            await createCustomUrl(newArticleUrl);
            
            // Poll for status until it's not NEW
            let status = 'NEW';
            let attempts = 0;
            while (status === 'NEW' && attempts < 10) {
                attempts++;
                const response = await getCustomUrl(newArticleUrl);
                if (!response) continue;
                status = response.status;
                if (status === 'NEW') {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
                }
            }
            
            if (status === 'NEW' || status === 'FAILED') {
                setErrorMessage('Failed to process the article. Please try again or use a different URL.');
                return;
            }
            
            setNewArticleUrl('');
            onClose();
        } catch (error) {
            console.error('Error creating custom URL:', error);
            setErrorMessage('An error occurred while creating the custom URL.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Article</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="article-url">URL</Label>
                    {isSaving ? (
                        <div className="flex items-center justify-center h-10 mt-2">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                        </div>
                    ) : (
                        <Input
                            id="article-url"
                            value={newArticleUrl}
                            onChange={(e) => setNewArticleUrl(e.target.value)}
                            placeholder="Enter article URL"
                            className="mt-2"
                        />
                    )}
                    {errorMessage && (
                        <div className="mt-2 text-sm text-red-600">
                            {errorMessage}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={!newArticleUrl || isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
