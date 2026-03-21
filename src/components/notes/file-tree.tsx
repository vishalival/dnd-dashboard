"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  FileText,
  FolderOpen,
  FolderClosed,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NoteFolderData, NoteDocumentData } from "@/lib/data";
import { Button } from "@/components/ui/button";

interface FileTreeProps {
  folders: NoteFolderData[];
  standaloneDocs: NoteDocumentData[];
  selectedDocId: string | null;
  onSelectDoc: (doc: NoteDocumentData) => void;
  onAddDoc: (folderId: string) => void;
  onDeleteDoc: (docId: string) => void;
}

export function FileTree({
  folders,
  standaloneDocs,
  selectedDocId,
  onSelectDoc,
  onAddDoc,
  onDeleteDoc,
}: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    () => new Set(folders.map((f) => f.id))
  );

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-1 py-2">
      {folders.map((folder) => {
        const isExpanded = expandedFolders.has(folder.id);
        return (
          <div key={folder.id}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleFolder(folder.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleFolder(folder.id);
                }
              }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/[0.04] rounded-md transition-colors group cursor-pointer"
            >
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.15 }}
              >
                <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
              </motion.div>
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 text-orange-400/80" />
              ) : (
                <FolderClosed className="h-4 w-4 text-orange-400/80" />
              )}
              <span className="truncate font-medium">{folder.name}</span>
              {folder.allowNewDocs && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddDoc(folder.id);
                  }}
                  className="ml-auto h-5 w-5 p-0 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-zinc-300"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            {isExpanded && (
              <div className="ml-3 border-l border-white/[0.06] pl-1">
                {folder.documents.map((doc) => (
                  <DocItem
                    key={doc.id}
                    doc={doc}
                    isSelected={selectedDocId === doc.id}
                    onSelect={() => onSelectDoc(doc)}
                    onDelete={
                      doc.isDeletable
                        ? () => onDeleteDoc(doc.id)
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {standaloneDocs.length > 0 && (
        <>
          <div className="h-px bg-white/[0.06] mx-3 my-2" />
          {standaloneDocs.map((doc) => (
            <DocItem
              key={doc.id}
              doc={doc}
              isSelected={selectedDocId === doc.id}
              onSelect={() => onSelectDoc(doc)}
            />
          ))}
        </>
      )}
    </div>
  );
}

function DocItem({
  doc,
  isSelected,
  onSelect,
  onDelete,
}: {
  doc: NoteDocumentData;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2 w-full px-3 py-1.5 text-sm rounded-md transition-colors group",
        isSelected
          ? "bg-white/[0.08] text-white"
          : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
      )}
    >
      <FileText className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
      <span className="truncate">{doc.title}</span>
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-auto h-5 w-5 p-0 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </button>
  );
}
