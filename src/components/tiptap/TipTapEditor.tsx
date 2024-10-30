import {useEditor, EditorContent, EditorProvider, FloatingMenu, BubbleMenu} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextEditorMenuBar from "./TextEditorMenuBar";
import React from "react";
import MenuBar from "@/components/MenuBar";
import {TextAlign} from "@tiptap/extension-text-align";
import './styles.scss'

import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import Blockquote from '@tiptap/extension-blockquote'

type TextEditorProps = {
    initialContent?: string;
};

export default function TipTapEditor({
    initialContent,
}: TextEditorProps) {
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
        content: '<blockquote>\n' +
            '        Nothing is impossible, the word itself says “I’m possible!”\n' +
            '      </blockquote>\n' +
            '      <p>Audrey Hepburn</p>',
        autofocus: true,
        injectCSS: false,
        editorProps: {
            attributes: {
                class: 'tiptap-editor'
            }
        },
        immediatelyRender: false
    })

    return (
        <div>
            <TextEditorMenuBar editor={editor}/>
            <EditorContent editor={editor} />
        </div>
    )
}
