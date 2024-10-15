import {useEditor, EditorContent, EditorProvider, FloatingMenu, BubbleMenu} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextEditorMenuBar from "./TextEditorMenuBar";
import React from "react";
import MenuBar from "@/components/MenuBar";
import {TextAlign} from "@tiptap/extension-text-align";


type TextEditorProps = {
    initialContent?: string; // Add this line
  };


export default function RichTextEditor({
    initialContent,
  }: TextEditorProps) {
    const extensions = [StarterKit, Underline,
        TextAlign.configure({
            defaultAlignment: 'left',
            types: ['heading', 'paragraph'],
    })];
    const editor = useEditor({
        extensions: extensions,
        content: initialContent,
        editorProps: {
            attributes: {
                class: "min-h-[150px] cursor-text rounded-md border p-5 ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 "
            }
        },
        immediatelyRender: false
    })
  return (
    <div>
        {/*<EditorProvider slotBefore={<MenuBar/>} extensions={extensions}  content={initialContent}>*/}
        {/*    <BubbleMenu editor={null}><textarea content="edit...."></textarea></BubbleMenu>*/}
        {/*</EditorProvider>*/}
        <TextEditorMenuBar editor={editor}/>
        <EditorContent  editor={editor} />
    </div>
  )
}