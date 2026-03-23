"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { Folder, NoteWithFolder, CATEGORIES, CATEGORY_LABELS } from "@/lib/types";

function EditNoteContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const DRAFT_KEY = `note-draft-edit-${id}`;

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("textbook");
  const [folderId, setFolderId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [currentPdf, setCurrentPdf] = useState("");
  const [currentPdfFilename, setCurrentPdfFilename] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [draftSaved, setDraftSaved] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/notes/${id}`).then((r) => r.json()),
      fetch("/api/folders").then((r) => r.json()),
    ])
      .then(([note, foldersData]: [NoteWithFolder, Folder[]]) => {
        setFolders(foldersData);

        let usedDraft = false;
        try {
          const raw = localStorage.getItem(DRAFT_KEY);
          if (raw) {
            const draft = JSON.parse(raw);
            if (draft.title || draft.description) {
              setTitle(draft.title || "");
              setCategory(draft.category || note.category);
              setFolderId(draft.folderId || note.folder_id || "");
              setDescription(draft.description || "");
              usedDraft = true;
            }
          }
        } catch {}

        if (!usedDraft) {
          setTitle(note.title);
          setCategory(note.category);
          setFolderId(note.folder_id || "");
          setDescription(note.description || "");
        }

        setCurrentPdf(note.pdf_url || "");
        setCurrentPdfFilename(note.pdf_filename || "");
        setLoading(false);
        setInitialized(true);
      })
      .catch(() => {
        setError("Failed to load note");
        setLoading(false);
      });
  }, [id, DRAFT_KEY]);

  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, category, folderId, description }));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 1500);
    } catch {}
  }, [title, category, folderId, description, DRAFT_KEY]);

  useEffect(() => {
    if (!initialized) return;
    const timer = setTimeout(() => {
      if (title || description) {
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, category, folderId, description }));
        } catch {}
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [title, category, folderId, description, initialized, DRAFT_KEY]);

  function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      let pdfUrl = currentPdf;
      let pdfFilename = currentPdfFilename;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          let msg = "Upload failed";
          try { const d = await uploadRes.json(); msg = d.error || msg; } catch {}
          throw new Error(msg);
        }

        const uploadData = await uploadRes.json();
        pdfUrl = uploadData.url;
        pdfFilename = uploadData.filename;
      }

      const noteRes = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          description,
          pdf_url: pdfUrl,
          pdf_filename: pdfFilename,
          folder_id: folderId || null,
        }),
      });

      if (!noteRes.ok) {
        let msg = "Failed to update note";
        try { const d = await noteRes.json(); msg = d.error || msg; } catch {}
        throw new Error(msg);
      }

      clearDraft();
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-muted">Loading note...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/admin/dashboard" className="text-sm text-muted hover:text-foreground">
        &larr; Back to dashboard
      </Link>

      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit Note</h1>
        <button
          type="button"
          onClick={saveDraft}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
        >
          {draftSaved ? "Saved!" : "Save draft"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-foreground"
            required
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="mb-1.5 block text-sm font-medium">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-foreground"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="folder" className="mb-1.5 block text-sm font-medium">Folder</label>
            <select
              id="folder"
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-foreground"
            >
              <option value="">No folder</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="pdf" className="mb-1.5 block text-sm font-medium">PDF File</label>
          {currentPdfFilename && (
            <p className="mb-2 text-sm text-muted">Current: {currentPdfFilename}</p>
          )}
          <input
            id="pdf"
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-muted file:mr-3 file:rounded-lg file:border file:border-border file:bg-card file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-background"
          />
          {currentPdfFilename && (
            <p className="mt-1 text-xs text-muted">Leave empty to keep the current PDF.</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Explanation</label>
          <MarkdownEditor value={description} onChange={setDescription} />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
          <Link href="/admin/dashboard" className="text-sm text-muted hover:text-foreground">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function EditNotePage() {
  return (
    <AdminGuard>
      <EditNoteContent />
    </AdminGuard>
  );
}
