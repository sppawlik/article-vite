import React, { useState, useCallback, useRef, useEffect } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleTable } from "@/features/articles/ArticleTable";
import { TipTapEditor } from "@/features/newsletter/TipTapEditor";
import { UserArticle, getUserArticles } from "@/api/articleService";
import { SummarySize } from "@/types/types";
import { generateClient } from "aws-amplify/api";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import type { Schema } from "../../../amplify/data/resource";

const client = generateClient<Schema>();

interface CreateNewsletterResponse {
  createNewsletter: {
    id: string;
    createdAt: string;
    owner: string;
    status: string;
    updatedAt: string;
    articles: {
      long: string[];
      medium: string[];
      short: string[];
    };
  };
}

export function NewsletterBuilder() {
  const editor = useCreateBlockNote();
  const [activeTab, setActiveTab] = useState("all");
  
  const [articles, setArticles] = useState<UserArticle[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const fetchingRef = useRef(false);
  const [newsletterId, setNewsletterId] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    if (fetchingRef.current || hasFetched) return;
    fetchingRef.current = true;
    setLoadingArticles(true);
    setError(null);
    try {
      const fetchedArticles = await getUserArticles();
      setArticles(fetchedArticles);
      setHasFetched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching articles.');
    } finally {
      setLoadingArticles(false);
      fetchingRef.current = false;
    }
  }, [hasFetched]);

  useEffect(() => {
    console.log('useEffect running, hasFetched:', hasFetched);
    if (!hasFetched) {
      fetchArticles();
    }
  }, [fetchArticles, hasFetched]);

  const handleGenerateNewsletter = async (articles: Record<SummarySize, string[]>) => {
    console.log('Generating newsletter with selected articles:', articles);
    setActiveTab("tiptap");
    setError(null);
    try {
      const input = {
        status: "PENDING",
        articles: {
          short: articles.short,
          medium: articles.medium,
          long: articles.long
        }
      };

      const result = await client.graphql<CreateNewsletterResponse>({
        query: `mutation CreateUserNewsletter($input: CreateNewsletterInput!) {
          createNewsletter(input: $input) {
            id
            createdAt
            owner
            status
            updatedAt
            articles {
              long
              medium
              short
            }
          }
        }`,
        variables: {
          input
        }
      }) as GraphQLResult<CreateNewsletterResponse>;

      if (result.data?.createNewsletter?.id) {
        setNewsletterId(result.data.createNewsletter.id);
        console.log('Newsletter submitted successfully with ID:', result.data.createNewsletter.id);
      } else {
        throw new Error('Failed to get newsletter ID from response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting the newsletter');
      console.error('Failed to submit newsletter:', err);
    } finally {
    }
  };

  const renderArticleContent = () => {
    if (loadingArticles) {
      return <div>Loading articles...</div>;
    }

    if (error) {
      return <div>Error: {error}</div>;
    }

    return (
      <ArticleTable 
        articles={articles}
        onGenerateNewsletter={handleGenerateNewsletter} 
      />
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="flex items-center ">
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
            {renderArticleContent()}
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
            <TipTapEditor newsletterId={newsletterId} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
