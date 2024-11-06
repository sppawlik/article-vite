import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getNewsletter } from "@/api/newsletterService";
import Markdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import { Newsletter } from "@/types/types";

interface NewsletterEditorProps {
    loading?: boolean;
    newsletterId: string | null;
    error: string | null;
}

export function MarkdownOutput({
    loading: initialLoading,
    newsletterId,
    error: initialError
}: NewsletterEditorProps) {
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
                            <style>
                                {`
                    .markdown-content {
                      text-align: justify;
                    }
                    .markdown-content ul {
                      padding-left: 0;
                      margin-top: 0.5em;
                      margin-bottom: 0.5em;
                      text-align: left;
                    }
                    .markdown-content ul li {
                      position: relative;
                      padding-left: 1.5em;
                      margin: 0.2em 0;
                      line-height: 1.6;
                    }
                    .markdown-content ul li::before {
                      content: "•";
                      position: absolute;
                      left: 0.5em;
                      color: #666;
                    }
                    .markdown-content strong {
                      font-weight: 600;
                    }
                    .markdown-content p {
                      text-align: justify;
                      margin-bottom: 1em;
                    }
                  `}
                            </style>
                            <div className="markdown-content">
                                <Markdown
                                    rehypePlugins={[rehypeSanitize, rehypeHighlight]}>{newsletter.baseNewsletter}</Markdown>
                            </div>
                            <div>
                                <h3 className="font-medium">Created: {new Date(newsletter.createDate).toLocaleString()}</h3>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
