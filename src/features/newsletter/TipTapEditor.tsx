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
import './styles.scss';

type TextEditorProps = {
    newsletterId: string | null;
};

export function TipTapEditor({ newsletterId }: TextEditorProps) {
    const [newsletter, setNewsletter] = useState<UserNewsletter | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                // const data = await getNewsletter(newsletterId);
                const data2 = await getUserNewsletter(newsletterId);
                setNewsletter(data2);
                setError(null);
                return data2;
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
            <div className="flex-1 overflow-auto">
                {error && (
                    <div className="mb-4 p-4 text-red-500 bg-red-100 rounded">
                        {error}
                    </div>
                )}
                {(!newsletter || newsletter?.status  === 'PENDING') ? (
                    <div className="flex items-center min-w-[800px] justify-center h-full top-4">
                        <p>Loading... It can around one minute</p>
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
