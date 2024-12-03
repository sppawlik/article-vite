import React, { useState, useCallback, useRef, useEffect } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleTable } from "@/features/articles/ArticleTable";
import { TipTapEditor } from "@/features/newsletter/TipTapEditor";
import { UserArticle, getUserArticles, listArticle } from "@/api/articleService";
import { SummarySize } from "@/types/types";
import { generateClient } from "aws-amplify/api";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { LogOut } from "lucide-react";

const client = generateClient();

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

type SelectedArticlesMap = { [key: number]: SummarySize };

export function NewsletterBuilder() {
  const editor = useCreateBlockNote();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedArticles, setSelectedArticles] = useState<SelectedArticlesMap>({});
  
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
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
      const fetchedArticles = await listArticle(twoWeeksAgo);
      //const fetchedArticles = await getUserArticles();
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
    if (!hasFetched) {
      fetchArticles();
    }
  }, [fetchArticles, hasFetched]);

  const handleGenerateNewsletter = async (articles: Record<SummarySize, string[]>) => {
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
      } else {
        throw new Error('Failed to get newsletter ID from response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting the newsletter');
      console.error('Failed to submit newsletter:', err);
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
        selectedArticles={selectedArticles}
        onSelectedArticlesChange={setSelectedArticles}
      />
    );
  };


    const { signOut } = useAuthenticator();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1">
      <div className="flex items-center justify-between w-full">
        <TabsList className="gap-2">
          <TabsTrigger value="all">Article List</TabsTrigger>
          <TabsTrigger value="tiptap">Newsletter</TabsTrigger>
        </TabsList>
        <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        signOut();
                                    }}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                                >
                                    <LogOut className="h-5 w-5"/>
                                    <span className="sr-only">Logout</span>
                                </a>
      </div>
      

      <TabsContent value="all" className="p-0 w-full">
        <Card className="w-full">
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
      <TabsContent value="blocknote" className="p-0">
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
      <TabsContent value="tiptap" className="p-0">
        <Card className="w-full">
          <CardContent>
            <TipTapEditor newsletterId={newsletterId} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
