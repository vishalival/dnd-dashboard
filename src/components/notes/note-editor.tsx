"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NoteEditorProps {
  documentId: string;
  initialContent: unknown;
  saveStatus: "saved" | "saving" | "unsaved";
  onSaveStatusChange: (status: "saved" | "saving" | "unsaved") => void;
  onContentSave?: (documentId: string, content: unknown) => void;
}

export function NoteEditor({
  documentId,
  initialContent,
  saveStatus,
  onSaveStatusChange,
  onContentSave,
}: NoteEditorProps) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentDocIdRef = useRef(documentId);

  const saveContent = useCallback(
    async (docId: string, content: unknown) => {
      onSaveStatusChange("saving");
      try {
        await fetch(`/api/notes/${docId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        onContentSave?.(docId, content);
        if (currentDocIdRef.current === docId) {
          onSaveStatusChange("saved");
        }
      } catch {
        if (currentDocIdRef.current === docId) {
          onSaveStatusChange("unsaved");
        }
      }
    },
    [onSaveStatusChange, onContentSave]
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
    ],
    content: (initialContent as Record<string, unknown>) || undefined,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm max-w-none focus:outline-none min-h-[calc(100vh-12rem)] px-6 py-4",
      },
    },
    onUpdate: ({ editor }) => {
      onSaveStatusChange("unsaved");
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveContent(currentDocIdRef.current, editor.getJSON());
      }, 1500);
    },
  });

  // Handle document switching
  useEffect(() => {
    if (!editor) return;

    // Flush pending save for the previous doc
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
      // Save the previous doc's content
      if (currentDocIdRef.current !== documentId) {
        saveContent(currentDocIdRef.current, editor.getJSON());
      }
    }

    currentDocIdRef.current = documentId;
    editor.commands.setContent(
      (initialContent as Record<string, unknown>) || { type: "doc", content: [] }
    );
    onSaveStatusChange("saved");
  }, [documentId, initialContent, editor, saveContent, onSaveStatusChange]);

  // Flush pending save on unmount
  const editorRef = useRef(editor);
  editorRef.current = editor;
  const saveContentRef = useRef(saveContent);
  saveContentRef.current = saveContent;

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Flush the pending save
        if (editorRef.current) {
          saveContentRef.current(currentDocIdRef.current, editorRef.current.getJSON());
        }
      }
    };
  }, []);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-4 py-2 border-b border-white/[0.06] flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          icon={Bold}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          icon={Italic}
        />
        <div className="w-px h-5 bg-white/[0.08] mx-1" />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
          icon={Heading1}
        />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          icon={Heading2}
        />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          icon={Heading3}
        />
        <div className="w-px h-5 bg-white/[0.08] mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          icon={List}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          icon={ListOrdered}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          icon={Quote}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          icon={Code2}
        />
        <div className="w-px h-5 bg-white/[0.08] mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          isActive={false}
          icon={Undo}
          disabled={!editor.can().undo()}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          isActive={false}
          icon={Redo}
          disabled={!editor.can().redo()}
        />

        <div className="ml-auto text-xs text-zinc-500">
          {saveStatus === "saving" && "Saving..."}
          {saveStatus === "saved" && "Saved"}
          {saveStatus === "unsaved" && "Unsaved"}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({
  onClick,
  isActive,
  icon: Icon,
  disabled,
}: {
  onClick: () => void;
  isActive: boolean;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-7 w-7 p-0",
        isActive
          ? "bg-white/[0.1] text-white"
          : "text-zinc-400 hover:text-zinc-200"
      )}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
