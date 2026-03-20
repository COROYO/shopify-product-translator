"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo,
  Redo,
} from "lucide-react";

const scToolbarBtn =
  "sc-p-1.5 sc-rounded sc-text-gray-600 dark:sc-text-gray-300 hover:sc-bg-gray-200 dark:hover:sc-bg-gray-600 disabled:sc-opacity-40 disabled:sc-pointer-events-none";

export function ScRichTextEditor({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "sc-text-blue-600 dark:sc-text-blue-400 sc-underline",
        },
      }),
    ],
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="sc-h-[120px] sc-w-full sc-max-h-[600px] sc-rounded-md sc-border sc-border-gray-300 dark:sc-border-gray-600 dark:sc-bg-gray-700 sc-animate-pulse" />
    );
  }

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="sc-rich-editor sc-w-full sc-max-h-[600px] sc-overflow-hidden sc-rounded-md sc-border sc-border-gray-300 dark:sc-border-gray-600 dark:sc-bg-gray-700 focus-within:sc-border-blue-500 focus-within:sc-ring-1 focus-within:sc-ring-blue-500">
      <div className="sc-flex sc-flex-wrap sc-gap-0.5 sc-border-b sc-border-gray-200 dark:sc-border-gray-600 sc-bg-gray-50 dark:sc-bg-gray-800/80 sc-px-1 sc-py-1">
        <button
          type="button"
          className={scToolbarBtn}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled || !editor.can().chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          className={scToolbarBtn}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled || !editor.can().chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          className={scToolbarBtn}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={disabled}
          title="Heading 2"
        >
          <span className="sc-text-xs sc-font-bold sc-px-0.5">H2</span>
        </button>
        <button
          type="button"
          className={scToolbarBtn}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={disabled}
          title="Heading 3"
        >
          <span className="sc-text-xs sc-font-bold sc-px-0.5">H3</span>
        </button>
        <button
          type="button"
          className={scToolbarBtn}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          title="Bullet list"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          className={scToolbarBtn}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          title="Numbered list"
        >
          <ListOrdered size={16} />
        </button>
        <button
          type="button"
          className={scToolbarBtn}
          onClick={setLink}
          disabled={disabled}
          title="Link"
        >
          <LinkIcon size={16} />
        </button>
        <button
          type="button"
          className={scToolbarBtn}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().chain().focus().undo().run()}
          title="Undo"
        >
          <Undo size={16} />
        </button>
        <button
          type="button"
          className={scToolbarBtn}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().chain().focus().redo().run()}
          title="Redo"
        >
          <Redo size={16} />
        </button>
      </div>
      <div className="sc-rich-editor-scroll sc-max-h-[calc(600px-2.75rem)] sc-overflow-y-auto">
        <EditorContent
          editor={editor}
          className="sc-rich-editor-content sc-p-2 sc-text-sm dark:sc-text-white [&_.ProseMirror]:sc-min-h-[80px] [&_.ProseMirror]:sc-outline-none [&_.ProseMirror_p]:sc-mb-2 [&_.ProseMirror_p:last-child]:sc-mb-0 [&_.ProseMirror_ul]:sc-list-disc [&_.ProseMirror_ul]:sc-pl-5 [&_.ProseMirror_ol]:sc-list-decimal [&_.ProseMirror_ol]:sc-pl-5 [&_.ProseMirror_h2]:sc-text-lg [&_.ProseMirror_h2]:sc-font-bold [&_.ProseMirror_h2]:sc-mb-2 [&_.ProseMirror_h3]:sc-text-base [&_.ProseMirror_h3]:sc-font-bold [&_.ProseMirror_h3]:sc-mb-1"
        />
      </div>
    </div>
  );
}
