import React, { useState, useCallback, useRef, useEffect } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleTable } from "@/features/articles/ArticleTable";
import { TipTapEditor } from "@/features/newsletter/TipTapEditor";
import { UserArticle, getArticles, getUserArticles } from "@/api/articleService";
import { submitNewsletter } from "@/api/newsletterService";
import { SummarySize } from "@/types/types";

type SelectedArticles = { [key: number]: SummarySize };

export function NewsletterBuilder() {
  const editor = useCreateBlockNote();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedArticles, setSelectedArticles] = useState<SelectedArticles>({});
  
  const [articles, setArticles] = useState<UserArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const fetchingRef = useRef(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterId, setNewsletterId] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    if (fetchingRef.current || hasFetched) return;
    fetchingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const fetchedArticles = await getUserArticles();
      setArticles(fetchedArticles);
      setHasFetched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching articles.');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [hasFetched]);

  useEffect(() => {
    if (!hasFetched) {
      fetchArticles();
    }
  }, [fetchArticles, hasFetched]);

  const handleGenerateNewsletter = async (selectedArticlesMap: Record<SummarySize, string[]>) => {
    setActiveTab("tiptap");
    setNewsletterLoading(true);
    setError(null);
    try {
      const id = await submitNewsletter({ articles: selectedArticlesMap });
      setNewsletterId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting the newsletter');
      console.error('Failed to submit newsletter:', err);
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="flex items-center">
        <TabsList className="gap-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="tiptap">Tiptap</TabsTrigger>
          <TabsTrigger value="blocknote">Editor</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="all">
        <Card>
          <CardHeader>
            <CardTitle>Articles</CardTitle>
            <CardDescription>
              Manage your articles and view their performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ArticleTable 
              articles={articles}
              loading={loading}
              error={error}
              onGenerateNewsletter={handleGenerateNewsletter}
              selectedArticles={selectedArticles}
              onSelectedArticlesChange={setSelectedArticles}
            />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="blocknote">
        <Card>
          <CardHeader>
            <CardTitle>Newsletter Editor</CardTitle>
            <CardDescription>
              Create and edit your newsletter content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BlockNoteView editor={editor} theme="light"/>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="tiptap">
        <Card>
          <CardContent>
            <TipTapEditor 
              loading={newsletterLoading}
              newsletterId={newsletterId}
              error={error}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
