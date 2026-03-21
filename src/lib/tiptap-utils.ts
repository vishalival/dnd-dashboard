import type { JSONContent } from "@tiptap/core";

/**
 * Extracts plain text from TipTap JSON content recursively.
 */
export function extractTextFromTipTap(doc: JSONContent): string {
  if (!doc) return "";

  const parts: string[] = [];

  if (doc.text) {
    parts.push(doc.text);
  }

  if (doc.content && Array.isArray(doc.content)) {
    for (const node of doc.content) {
      const text = extractTextFromTipTap(node);
      if (text) {
        parts.push(text);
      }
    }
  }

  // Add newlines between block-level nodes
  const blockTypes = [
    "paragraph",
    "heading",
    "blockquote",
    "codeBlock",
    "bulletList",
    "orderedList",
    "listItem",
    "horizontalRule",
    "taskList",
    "taskItem",
  ];

  if (doc.type && blockTypes.includes(doc.type)) {
    return parts.join("") + "\n";
  }

  return parts.join("");
}

/**
 * Formats an array of note documents into a single text block for use as LLM context.
 */
export function formatNotesForContext(
  docs: Array<{ title: string; content: unknown }>
): string {
  return docs
    .map((doc) => {
      const text = extractTextFromTipTap(doc.content as JSONContent).trim();
      if (!text) return null;
      return `## ${doc.title}\n${text}`;
    })
    .filter(Boolean)
    .join("\n\n---\n\n");
}

/**
 * Formats note documents with IDs embedded so Claude can reference them in citations.
 */
export function formatNotesForContextWithIds(
  docs: Array<{ id: string; title: string; content: unknown }>
): string {
  return docs
    .map((doc) => {
      const text = extractTextFromTipTap(doc.content as JSONContent).trim();
      if (!text) return null;
      return `## ${doc.title} [docId:${doc.id}]\n${text}`;
    })
    .filter(Boolean)
    .join("\n\n---\n\n");
}
