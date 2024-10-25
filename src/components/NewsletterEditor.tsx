import React, { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  CornerDownLeft,
  Mic,
  Paperclip,
} from "lucide-react"
import { Article } from "@/api/articleService"
import { getNewsletter } from "@/api/newsletterService"
import { SummarySize } from "@/types/types"
import DOMPurify, {sanitize} from "dompurify";
import Markdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";

interface NewsletterEditorProps {
  loading?: boolean;
  newsletterId: string | null;
  error: string | null;
}

interface Newsletter {
  newsletterId: string;
  status: string;
  articles: Record<SummarySize, string[]>;
  createDate: string;
  newsletterPromptContent: string;
}

const NewsletterEditor: React.FC<NewsletterEditorProps> = ({ loading: initialLoading, newsletterId, error: initialError }) => {
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState(initialError);

  useEffect(() => {
    const fetchNewsletter = async () => {
      if (!newsletterId) return;

      try {
        setLoading(true);
        const data = await getNewsletter(newsletterId);
        setNewsletter(data);
        setError(null);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch newsletter');
      } finally {
        if (newsletter?.status !== 'PENDING') {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchNewsletter();

    // Set up polling interval if newsletterId exists
    let intervalId: NodeJS.Timeout | null = null;
    if (newsletterId) {
      intervalId = setInterval(async () => {
        const data = await fetchNewsletter();
        // Clear interval if status is no longer PENDING
        if (data && data.status !== 'PENDING') {
          if (intervalId) clearInterval(intervalId);
        }
      }, 5000);
    }

    // Cleanup function
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [newsletterId]); // Reset effect when newsletterId changes

  return (
    <main className="grid flex-1 gap-4 overflow-auto p-4">
      <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4">
        <Badge variant="outline" className="absolute right-3 top-3">
          {newsletter?.status === 'PENDING' || loading ? "Loading..." : newsletterId ? `Newsletter ID: ${newsletterId}` : "Output"}
        </Badge>
        <div className="flex-1 overflow-auto">
          {error && (
            <div className="mb-4 p-4 text-red-500 bg-red-100 rounded">
              {error}
            </div>
          )}
          {newsletter?.status === 'PENDING' ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading...</p>
            </div>
          ) : newsletter && (
              <div className="space-y-4">
                <div className="markdown-body">
                  <Markdown rehypePlugins={[rehypeSanitize, rehypeHighlight]}>{newsletter.newsletterPromptContent}</Markdown>
                      {/*<div dangerouslySetInnerHTML={{__html: newsletter.newsletterPromptContent}}/>*/}
                </div>
                <div>
                  <h3 className="font-medium">Created: {new Date(newsletter.createDate).toLocaleString()}</h3>
                </div>
              </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default NewsletterEditor
