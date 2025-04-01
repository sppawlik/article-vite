import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { GraphQLResult } from '@aws-amplify/api-graphql';
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Heading from '@tiptap/extension-heading';
import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import Link from '@tiptap/extension-link';
import { TextEditorMenuBar } from './TextEditorMenuBar';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useDataLayer } from '@/hooks/useDataLayer';
import './styles.scss';

interface NewsletterJobStatus {
  finalNewsletter: string;
  status: string;
}

interface GetNewsletterJobStatusResponse {
  getNewsletterJobStatus: NewsletterJobStatus;
}

export const NewsletterView = () => {
  // Get the UUID from the URL parameters
  const { uuid } = useParams<{ uuid: string }>();
  const { user } = useAuthenticator();
  const [newsletterContent, setNewsletterContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // Add dataLayer tracking

  //                   pushVirtualPageView('/edit', 'https://newsletter.creoscope.com/edit', 'https://newsletter.creoscope.com/wait', 'Nwsl edit', user);
  useDataLayer({
    pagePath: '/edit',
    pageUrl: 'https://newsletter.creoscope.com/edit',
    previousPageUrl: 'https://newsletter.creoscope.com/wait',
    pageTitle: 'Newsletter edit',
    user: user
  });

  useEffect(() => {
    const fetchNewsletterJobStatus = async () => {
      if (!uuid) return;

      try {
        setLoading(true);
        const client = generateClient();
        const query = /* GraphQL */ `
          query GetNewsletterJobStatus {
            getNewsletterJobStatus(jobUuid: "${uuid}") {
              finalNewsletter
              status
            }
          }
        `;

        const response = await client.graphql({
          query,
        }) as GraphQLResult<GetNewsletterJobStatusResponse>;

        if (!response.data?.getNewsletterJobStatus) {
          throw new Error('Newsletter job not found');
        }

        setNewsletterContent(response.data.getNewsletterJobStatus.finalNewsletter);
        setStatus(response.data.getNewsletterJobStatus.status);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch newsletter job status');
        console.error('Error fetching newsletter job status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletterJobStatus();
  }, [uuid]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Newsletter Preview</h1>
        
        {loading && (
          <div className="flex justify-center items-center p-8">
            <p className="text-xl">Loading newsletter content...</p>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {!loading && !error && newsletterContent && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <NewsletterEditor content={newsletterContent} />
          </div>
        )}
      </div>
    </div>
  );
};

interface NewsletterEditorProps {
  content: string;
}

const NewsletterEditor: React.FC<NewsletterEditorProps> = ({ content }) => {
  const extensions = [
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    Heading.configure({
      levels: [1, 2, 3],
    }),
    StarterKit.configure({
      bulletList: {
        keepMarks: true,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
    }), 
    Underline,
    Link
  ];
  
  const editor = useEditor({
    extensions: extensions,
    content: content,
    autofocus: false, // Don't autofocus as this is just for viewing
    injectCSS: false,
    editable: false, // Make it read-only
    editorProps: {
      attributes: {
        class: 'tiptap-editor'
      }
    },
  }, [content]); // Re-initialize when content changes

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div>
      <TextEditorMenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}; 