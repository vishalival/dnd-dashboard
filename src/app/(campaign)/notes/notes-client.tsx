"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { NotebookPen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampaignData, NoteDocumentData } from "@/lib/data";
import { PageHeader } from "@/components/shared/page-header";
import { FileTree } from "@/components/notes/file-tree";
import { NoteEditor } from "@/components/notes/note-editor";
import { CreateDocDialog } from "@/components/notes/create-doc-dialog";
import { NotesChatPanel } from "@/components/notes/notes-chat-panel";

export function NotesClient({ campaign }: { campaign: CampaignData }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [folders, setFolders] = useState(campaign.noteFolders);
  const [standaloneDocs, setStandaloneDocs] = useState(campaign.noteDocuments);

  const docParam = searchParams.get("doc");
  const [selectedDocId, setSelectedDocIdState] = useState<string | null>(docParam);

  // Sync selectedDocId state to URL
  useEffect(() => {
    const currentDoc = searchParams.get("doc");
    if (selectedDocId !== currentDoc) {
      const params = new URLSearchParams(searchParams.toString());
      if (selectedDocId) {
        params.set("doc", selectedDocId);
      } else {
        params.delete("doc");
      }
      router.replace(`/notes?${params.toString()}`, { scroll: false });
    }
  }, [selectedDocId, searchParams, router]);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved"
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createFolderId, setCreateFolderId] = useState<string | null>(null);
  const [highlightText, setHighlightText] = useState<string | null>(null);


  // Find the selected document from folders or standalone docs
  const selectedDoc = useMemo(() => {
    if (!selectedDocId) return null;
    for (const folder of folders) {
      const doc = folder.documents.find((d) => d.id === selectedDocId);
      if (doc) return doc;
    }
    return standaloneDocs.find((d) => d.id === selectedDocId) || null;
  }, [selectedDocId, folders, standaloneDocs]);

  const handleSelectDoc = useCallback((doc: NoteDocumentData) => {
    setSelectedDocIdState(doc.id);
    setHighlightText(null);
  }, []);

  const handleCitationClick = useCallback(
    (docId: string, quote: string) => {
      const docExists =
        folders.some((f) => f.documents.some((d) => d.id === docId)) ||
        standaloneDocs.some((d) => d.id === docId);
      if (!docExists) {
        console.warn("[Citation] Document not found:", docId);
        return;
      }
      setSelectedDocIdState(docId);
      setHighlightText(quote);
    },
    [folders, standaloneDocs]
  );

  const handleAddDoc = useCallback((folderId: string) => {
    setCreateFolderId(folderId);
    setCreateDialogOpen(true);
  }, []);

  const handleAddRootDoc = useCallback(() => {
    setCreateFolderId(null);
    setCreateDialogOpen(true);
  }, []);

  const handleDocCreated = useCallback(
    (doc: NoteDocumentData) => {
      if (doc.folderId) {
        setFolders((prev) =>
          prev.map((f) =>
            f.id === doc.folderId
              ? { ...f, documents: [...f.documents, doc] }
              : f
          )
        );
      } else {
        setStandaloneDocs((prev) => [...prev, doc]);
      }
      setSelectedDocIdState(doc.id);
    },
    []
  );

  const handleContentSave = useCallback(
    (docId: string, content: unknown) => {
      setFolders((prev) =>
        prev.map((f) => ({
          ...f,
          documents: f.documents.map((d) =>
            d.id === docId ? { ...d, content: content as typeof d.content } : d
          ),
        }))
      );
      setStandaloneDocs((prev) =>
        prev.map((d) =>
          d.id === docId ? { ...d, content: content as typeof d.content } : d
        )
      );
    },
    []
  );

  const handleDeleteDoc = useCallback(
    async (docId: string) => {
      const res = await fetch(`/api/notes/${docId}`, { method: "DELETE" });
      if (res.ok) {
        setFolders((prev) =>
          prev.map((f) => ({
            ...f,
            documents: f.documents.filter((d) => d.id !== docId),
          }))
        );
        if (selectedDocId === docId) {
          setSelectedDocIdState(null);
        }
      }
    },
    [selectedDocId]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-48px)] overflow-hidden">
      <PageHeader
        title="The Tome of Schemes"
        subtitle="Ink your machinations and session blueprints — the Chronicle consults these pages when fate unfolds at the table"
        icon={<NotebookPen className="h-5 w-5 text-orange-400" />}
      />

      <div className="flex flex-1 min-h-0 mt-6">
        {/* File Tree Sidebar */}
        <div className="w-64 shrink-0 border-r border-white/[0.06] overflow-y-auto scrollbar-thin">
          <FileTree
            folders={folders}
            standaloneDocs={standaloneDocs}
            selectedDocId={selectedDocId}
            onSelectDoc={handleSelectDoc}
            onAddDoc={handleAddDoc}
            onAddRootDoc={handleAddRootDoc}
            onDeleteDoc={handleDeleteDoc}
          />
        </div>

        {/* Editor Area */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {selectedDoc ? (
            <div className="h-full flex flex-col">
              <div className="px-6 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <h2 className="text-lg font-heading font-semibold text-zinc-100">
                  {selectedDoc.title}
                </h2>
                {selectedDoc.slug?.startsWith("session-outline-") && (
                  <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
                    <Link href="/sessions">
                      <ExternalLink className="h-3.5 w-3.5" />
                      View in Session Planner
                    </Link>
                  </Button>
                )}
              </div>
              <div className="flex-1 min-h-0">
                <NoteEditor
                  key={selectedDoc.id}
                  documentId={selectedDoc.id}
                  initialContent={selectedDoc.content}
                  saveStatus={saveStatus}
                  onSaveStatusChange={setSaveStatus}
                  onContentSave={handleContentSave}
                  highlightText={highlightText}
                  onHighlightClear={() => setHighlightText(null)}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500">
              <div className="text-center">
                <NotebookPen className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
                <p className="text-sm">Select a document to start writing</p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Panel - Always visible */}
        <NotesChatPanel
          campaignId={campaign.id}
          onCitationClick={handleCitationClick}
        />
      </div>

      <CreateDocDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        folderId={createFolderId}
        campaignId={campaign.id}
        onCreated={handleDocCreated}
      />

    </div>
  );
}
