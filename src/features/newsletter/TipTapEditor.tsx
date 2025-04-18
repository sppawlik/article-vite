import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Heading from '@tiptap/extension-heading';
import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import Link from '@tiptap/extension-link';
import React, { useEffect, useState } from "react";
import { TextEditorMenuBar } from "./TextEditorMenuBar";
import { getUserNewsletter, UserNewsletter} from "@/api/newsletterService";
import { useAuthenticator } from '@aws-amplify/ui-react';
import './styles.scss';

type TextEditorProps = {
    newsletterId: string | null;
};

const pushVirtualPageView = (pagePath: string, pageUrl: string, previousPageUrl: string, pageTitle: string, user: any): void => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'virtual_page_view',
    page_path: pagePath,
    page_url: pageUrl,
    previous_page_url: previousPageUrl,
    page_title: pageTitle,
    user_id: user?.userId,
    user: user
  });
};



export function TipTapEditor({ newsletterId }: TextEditorProps) {
    const [newsletter, setNewsletter] = useState<UserNewsletter | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuthenticator();
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
        content: newsletter?.baseNewsletter || '<em>test</em>',
        autofocus: true,
        injectCSS: false,
        editorProps: {
            attributes: {
                class: 'tiptap-editor'
            }
        },
        immediatelyRender: false
    }, [newsletter?.baseNewsletter]); // Initialize editor when content changes
  
    useEffect(() => {
        const fetchNewsletter = async () => {
            if (!newsletterId) return;
            try {
                setLoading(true);
                const newsletter = await getUserNewsletter(newsletterId);
                setNewsletter(newsletter);
                setError(null);
                return newsletter;
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
            pushVirtualPageView('/wait', 'https://newsletter.creoscope.com/wait', 'https://newsletter.creoscope.com/list', 'Nwsl wait', user);

            intervalId = setInterval(async () => {
                const data = await fetchNewsletter();
                // Clear interval if status is no longer PENDING
                if (data && data.status !== 'PENDING') {
                    pushVirtualPageView('/edit', 'https://newsletter.creoscope.com/edit', 'https://newsletter.creoscope.com/wait', 'Nwsl edit', user);

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
            <div className="flex-1 overflow-auto">
                {error && (
                    <div className="mb-4 p-4 text-red-500 bg-red-100 rounded">
                        {error}
                    </div>
                )}
                {(!newsletter || newsletter?.status  === 'PENDING') ? (
                    <div className="flex items-center min-w-[800px] justify-center h-full top-4">
                        <p>Loading... It can take around one minute</p>
                    </div>
                ) : editor && (
                    <div>
                        <TextEditorMenuBar editor={editor}/>
                        <EditorContent editor={editor} />
                    </div>
                )}
            </div>
        </>
    );
}
