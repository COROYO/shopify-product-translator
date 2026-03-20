"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect, useState } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo,
  Redo,
  ImagePlus,
  Code2,
} from "lucide-react";

const scToolbarBtn =
  "sc-p-1.5 sc-rounded sc-text-gray-600 dark:sc-text-gray-300 hover:sc-bg-gray-200 dark:hover:sc-bg-gray-600 disabled:sc-opacity-40 disabled:sc-pointer-events-none";

const scTabBtn =
  "sc-px-2 sc-py-1 sc-rounded sc-text-xs sc-font-medium sc-transition-colors disabled:sc-opacity-40 disabled:sc-pointer-events-none";

export function ScRichTextEditor({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
}) {
  const [mode, setMode] = useState<"visual" | "code">("visual");
  const [codeDraft, setCodeDraft] = useState("");

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
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "sc-max-w-full sc-h-auto sc-rounded sc-my-2",
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
    editor.setEditable(!disabled && mode === "visual");
  }, [disabled, editor, mode]);

  useEffect(() => {
    if (!editor || mode === "code") return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor, mode]);

  if (!editor) {
    return (
      <div className="sc-h-[120px] sc-w-full sc-max-h-[600px] sc-rounded-md sc-border sc-border-gray-300 dark:sc-border-gray-600 dark:sc-bg-gray-700 sc-animate-pulse" />
    );
  }

  const visualDisabled = disabled || mode === "code";

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

  const addImage = () => {
    const url = window.prompt("Image URL (https://…)", "https://");
    if (!url?.trim()) return;
    const alt = window.prompt("Alt text (optional)", "") ?? "";
    editor.chain().focus().setImage({ src: url.trim(), alt: alt.trim() }).run();
  };

  const showCode = () => {
    const html = editor.getHTML();
    setCodeDraft(html);
    onChange(html);
    setMode("code");
  };

  const showVisual = () => {
    editor.commands.setContent(codeDraft || "", { emitUpdate: true });
    setMode("visual");
  };

  return (
    <div className="sc-rich-editor sc-w-full sc-max-h-[600px] sc-overflow-hidden sc-rounded-md sc-border sc-border-gray-300 dark:sc-border-gray-600 dark:sc-bg-gray-700 focus-within:sc-border-blue-500 focus-within:sc-ring-1 focus-within:sc-ring-blue-500">
      <div className="sc-flex sc-flex-wrap sc-items-center sc-gap-0.5 sc-border-b sc-border-gray-200 dark:sc-border-gray-600 sc-bg-gray-50 dark:sc-bg-gray-800/80 sc-px-1 sc-py-1">
        <button
          type="button"
          className={scToolbarBtn}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={
            visualDisabled || !editor.can().chain().focus().toggleBold().run()
          }
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          className={scToolbarBtn}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={
            visualDisabled ||
            !editor.can().chain().focus().toggleItalic().run()
          }
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          className={scToolbarBtn}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={visualDisabled}
          title="Heading 2"
        >
          <span className="sc-text-xs sc-font-bold sc-px-0.5">H2</span>
        </button>
        <button
          type="button"
          className={scToolbarBtn}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={visualDisabled}
          title="Heading 3"
        >
          <span className="sc-text-xs sc-font-bold sc-px-0.5">H3</span>
        </button>
        <button
          type="button"
          className={scToolbarBtn}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={visualDisabled}
          title="Bullet list"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          className={scToolbarBtn}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={visualDisabled}
          title="Numbered list"
        >
          <ListOrdered size={16} />
        </button>
        <button
          type="button"
          className={scToolbarBtn}
          onClick={setLink}
          disabled={visualDisabled}
          title="Link"
        >
          <LinkIcon size={16} />
        </button>
        <button
          type="button"
          className={scToolbarBtn}
          onClick={addImage}
          disabled={visualDisabled}
          title="Insert image"
        >
          <ImagePlus size={16} />
        </button>
        <button
          type="button"
          className={scToolbarBtn}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={visualDisabled || !editor.can().chain().focus().undo().run()}
          title="Undo"
        >
          <Undo size={16} />
        </button>
        <button
          type="button"
          className={scToolbarBtn}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={visualDisabled || !editor.can().chain().focus().redo().run()}
          title="Redo"
        >
          <Redo size={16} />
        </button>

        <div className="sc-ml-auto sc-flex sc-items-center sc-gap-0.5 sc-pl-1">
          <Code2
            size={14}
            className="sc-text-gray-500 dark:sc-text-gray-400 sc-shrink-0"
            aria-hidden
          />
          <button
            type="button"
            className={`${scTabBtn} ${
              mode === "visual"
                ? "sc-bg-white dark:sc-bg-gray-700 sc-text-gray-900 dark:sc-text-white sc-shadow-sm"
                : "sc-text-gray-500 hover:sc-bg-gray-200/80 dark:hover:sc-bg-gray-700"
            }`}
            onClick={() => mode === "code" && showVisual()}
            disabled={disabled}
            title="Visual editor"
          >
            Visual
          </button>
          <button
            type="button"
            className={`${scTabBtn} ${
              mode === "code"
                ? "sc-bg-white dark:sc-bg-gray-700 sc-text-gray-900 dark:sc-text-white sc-shadow-sm"
                : "sc-text-gray-500 hover:sc-bg-gray-200/80 dark:hover:sc-bg-gray-700"
            }`}
            onClick={() => mode === "visual" && showCode()}
            disabled={disabled}
            title="Edit HTML"
          >
            HTML
          </button>
        </div>
      </div>
      <div className="sc-rich-editor-scroll sc-max-h-[calc(600px-2.75rem)] sc-overflow-y-auto">
        <div className={mode === "visual" ? "sc-block" : "sc-hidden"}>
          <EditorContent
            editor={editor}
            className="sc-rich-editor-content sc-p-2 sc-text-sm dark:sc-text-white [&_.ProseMirror]:sc-min-h-[80px] [&_.ProseMirror]:sc-outline-none [&_.ProseMirror_p]:sc-mb-2 [&_.ProseMirror_p:last-child]:sc-mb-0 [&_.ProseMirror_ul]:sc-list-disc [&_.ProseMirror_ul]:sc-pl-5 [&_.ProseMirror_ol]:sc-list-decimal [&_.ProseMirror_ol]:sc-pl-5 [&_.ProseMirror_h2]:sc-text-lg [&_.ProseMirror_h2]:sc-font-bold [&_.ProseMirror_h2]:sc-mb-2 [&_.ProseMirror_h3]:sc-text-base [&_.ProseMirror_h3]:sc-font-bold [&_.ProseMirror_h3]:sc-mb-1 [&_.ProseMirror_img]:sc-max-w-full [&_.ProseMirror_img]:sc-h-auto [&_.ProseMirror_img]:sc-rounded"
          />
        </div>
        {mode === "code" && (
          <textarea
            id="sc-rich-text-code"
            className="sc-rich-text-code sc-box-border sc-block sc-w-full sc-min-h-[120px] sc-resize-y sc-border-0 sc-bg-gray-900 sc-p-3 sc-font-mono sc-text-xs sc-leading-relaxed sc-text-green-100 sc-outline-none focus:sc-ring-0 dark:sc-bg-black/40"
            value={codeDraft}
            onChange={(e) => {
              const v = e.target.value;
              setCodeDraft(v);
              onChange(v);
            }}
            disabled={disabled}
            spellCheck={false}
            aria-label="HTML source"
          />
        )}
      </div>
    </div>
  );
}
