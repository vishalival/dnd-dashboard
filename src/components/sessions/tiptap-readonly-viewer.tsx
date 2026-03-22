"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { FileText } from "lucide-react";

interface TipTapReadonlyViewerProps {
  content: unknown;
}

export function TipTapReadonlyViewer({ content }: TipTapReadonlyViewerProps) {
  const editor = useEditor({
    editable: false,
    immediatelyRender: false,
    extensions: [StarterKit],
    content: content as Record<string, unknown> | null,
  });

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content as Record<string, unknown>);
    }
  }, [editor, content]);

  if (!content) {
    return (
      <div className="text-center py-12 text-muted-foreground dark:text-zinc-500">
        <FileText className="h-8 w-8 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No outline content yet. Edit this document in Tome of Schemes.</p>
      </div>
    );
  }

  return (
    <div className="prose prose-invert prose-sm max-w-none px-2 py-2">
      <EditorContent editor={editor} />
    </div>
  );
}
