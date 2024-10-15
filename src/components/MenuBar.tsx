import {
    RiBold,
    RiItalic,
    RiStrikethrough,
    RiCodeSSlashLine,
    RiListOrdered2,
  } from "react-icons/ri";
  import {Editor, useCurrentEditor} from "@tiptap/react";
  import { AiOutlineRedo, AiOutlineUndo } from "react-icons/ai";
  import { BsTypeUnderline } from "react-icons/bs";
  import { IoListOutline } from "react-icons/io5";
import React from "react";


  const Button = ({
    onClick,
    isActive,
    disabled,
    children,
  }: {
    onClick: () => void;
    isActive: boolean;
    disabled?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2 ${isActive ? "bg-violet-500 text-white rounded-md" : ""}`}
    >
      {children}
    </button>
  );

  export default function MenuBar() {
    const { editor } = useCurrentEditor()

    if (!editor) {
      return null
    }
    if (!editor) return null;
  
    const buttons = [
      {
        icon: <RiBold className="size-5" />,
        onClick: () => editor.chain().focus().toggleBold().run(),
        isActive: editor.isActive("bold"),
      },
      {
        icon: <BsTypeUnderline className="size-5" />,
        onClick: () => editor.chain().focus().toggleUnderline().run(),
        isActive: editor.isActive("underline"),
      },
      {
        icon: <RiItalic className="size-5" />,
        onClick: () => editor.chain().focus().toggleItalic().run(),
        isActive: editor.isActive("italic"),
        disabled: !editor.can().chain().focus().toggleItalic().run(),
      },
      {
        icon: <RiStrikethrough className="size-5" />,
        onClick: () => editor.chain().focus().toggleStrike().run(),
        isActive: editor.isActive("strike"),
        disabled: !editor.can().chain().focus().toggleStrike().run(),
      },
      {
        icon: <RiCodeSSlashLine className="size-5" />,
        onClick: () => editor.chain().focus().toggleCode().run(),
        isActive: editor.isActive("code"),
        disabled: !editor.can().chain().focus().toggleCode().run(),
      },
      {
        icon: <IoListOutline className="size-5" />,
        onClick: () => editor.chain().focus().toggleBulletList().run(),
        isActive: editor.isActive("bulletList"),
      },
      {
        icon: <RiListOrdered2 className="size-5" />,
        onClick: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: editor.isActive("orderedList"),
        disabled: !editor.can().chain().focus().toggleOrderedList().run(),
      },
      {
        icon: <AiOutlineUndo className="size-5" />,
        onClick: () => editor.chain().focus().undo().run(),
        isActive: editor.isActive("undo"),
        disabled: !editor.can().chain().focus().undo().run(),
      },
      {
        icon: <AiOutlineRedo className="size-5" />,
        onClick: () => editor.chain().focus().redo().run(),
        isActive: editor.isActive("redo"),
        disabled: !editor.can().chain().focus().redo().run(),
      },
    ];
  
    return (
        <div className="control-group">
          <div className="button-group">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={
                  !editor.can()
                      .chain()
                      .focus()
                      .toggleBold()
                      .run()
                }
                className={editor.isActive('bold') ? 'is-active' : ''}
            ><RiBold className="size-5"/>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={
                  !editor.can()
                      .chain()
                      .focus()
                      .toggleItalic()
                      .run()
                }
                className={editor.isActive('italic') ? 'is-active' : ''}
            ><RiItalic className="size-5"/>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={
                  !editor.can()
                      .chain()
                      .focus()
                      .toggleStrike()
                      .run()
                }
                className={editor.isActive('strike') ? 'is-active' : ''}
            >
              Strike
            </button>
            <button
                onClick={() => editor.chain().focus().toggleCode().run()}
                disabled={
                  !editor.can()
                      .chain()
                      .focus()
                      .toggleCode()
                      .run()
                }
                className={editor.isActive('code') ? 'is-active' : ''}
            >
              Code
            </button>
            <button onClick={() => editor.chain().focus().unsetAllMarks().run()}>
              Clear marks
            </button>
            <button onClick={() => editor.chain().focus().clearNodes().run()}>
              Clear nodes
            </button>
            <button
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={editor.isActive('paragraph') ? 'is-active' : ''}
            >
              Paragraph
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({level: 1}).run()}
                className={editor.isActive('heading', {level: 1}) ? 'is-active' : ''}
            >
              H1
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({level: 2}).run()}
                className={editor.isActive('heading', {level: 2}) ? 'is-active' : ''}
            >
              H2
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({level: 3}).run()}
                className={editor.isActive('heading', {level: 3}) ? 'is-active' : ''}
            >
              H3
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({level: 4}).run()}
                className={editor.isActive('heading', {level: 4}) ? 'is-active' : ''}
            >
              H4
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({level: 5}).run()}
                className={editor.isActive('heading', {level: 5}) ? 'is-active' : ''}
            >
              H5
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({level: 6}).run()}
                className={editor.isActive('heading', {level: 6}) ? 'is-active' : ''}
            >
              H6
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'is-active' : ''}
            >
              Bullet list
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'is-active' : ''}
            >
              Ordered list
            </button>
            <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={editor.isActive('codeBlock') ? 'is-active' : ''}
            >
              Code block
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive('blockquote') ? 'is-active' : ''}
            >
              Blockquote
            </button>
            <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
              Horizontal rule
            </button>
            <button onClick={() => editor.chain().focus().setHardBreak().run()}>
              Hard break
            </button>
            <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={
                  !editor.can()
                      .chain()
                      .focus()
                      .undo()
                      .run()
                }
            >
              <AiOutlineUndo className="size-5"/>
            </button>
            <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={
                  !editor.can()
                      .chain()
                      .focus()
                      .redo()
                      .run()
                }
            >
              Redo
            </button>
            <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={
                  !editor.can()
                      .chain()
                      .focus()
                      .redo()
                      .run()
                }
            >
              Redo
            </button>
          </div>
        </div>
    )
        // (
        //   <div className="mb-2 flex space-x-2">
        //     {buttons.map(({ icon, onClick, isActive, disabled }, index) => (
        //       <Button
        //         key={index}
        //         onClick={onClick}
        //         isActive={isActive}
        //         disabled={disabled}
        //       >
        //         {icon}
    //       </Button>
    //     ))}
    //   </div>
    // )


        ;
  }
  