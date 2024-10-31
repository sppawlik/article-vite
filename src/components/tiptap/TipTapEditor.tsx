import {useEditor, EditorContent, EditorProvider, FloatingMenu, BubbleMenu} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextEditorMenuBar from "./TextEditorMenuBar";
import React, { useEffect, useState } from "react";
import MenuBar from "@/components/MenuBar";
import {TextAlign} from "@tiptap/extension-text-align";
import './styles.scss'

import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import Blockquote from '@tiptap/extension-blockquote'
import { SummarySize } from "@/types/types";
import { getNewsletter } from "@/api/newsletterService";
import { Badge } from "../ui/badge";

type TextEditorProps = {
    loading?: boolean;
    newsletterId: string | null;
    error: string | null;
};

interface Newsletter {
    newsletterId: string;
    status: string;
    articles: Record<SummarySize, string[]>;
    createDate: string;
    newsletterPromptContent: string;
  }

export default function TipTapEditor({
    loading: initialLoading, newsletterId, error: initialError 
}: TextEditorProps) {

    const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
    const [loading, setLoading] = useState(initialLoading);
    const [error, setError] = useState(initialError);

    const extensions = [
        Color.configure({ types: [TextStyle.name, ListItem.name] }),
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
        Blockquote
    ];
    
    const editor = useEditor({
        extensions: extensions,
        content: newsletter?.newsletterPromptContent || '',
        autofocus: true,
        injectCSS: false,
        editorProps: {
            attributes: {
                class: 'tiptap-editor'
            }
        },
        immediatelyRender: false
    }, [newsletter?.newsletterPromptContent]) // Initialize editor when content changes
  
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
        <>
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
          ) : editor && (
            <div>
                <TextEditorMenuBar editor={editor}/>
                <EditorContent editor={editor} />
            </div>
          )}
        </div>
        </>
    )
}
