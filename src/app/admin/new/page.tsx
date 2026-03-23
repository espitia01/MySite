"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { Folder, CATEGORIES, CATEGORY_LABELS } from "@/lib/types";

const DRAFT_KEY = "note-draft-new";

interface Draft {
  title: string;
  category: string;
  folderId: string;
  description: string;
}

function NewNoteContent() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("textbook");
  const [folderId, setFolderId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  useEffect(() => {
    fetch("/api/folders")
      .then((res) => res.json())
      .then(setFolders)
      .catch(() => {});

    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft: Draft = JSON.parse(raw);
        setTitle(draft.title || "");
        setCategory(draft.category || "textbook");
        setFolderId(draft.folderId || "");
        setDescription(draft.description || "");
      }
    } catch {}
    setDraftLoaded(true);
  }, []);

  const saveDraft = useCallback(() => {
    const draft: Draft = { title, category, folderId, description };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 1500);
    } catch {}
  }, [title, category, folderId, description]);

  useEffect(() => {
    if (!draftLoaded) return;
    const timer = setTimeout(() => {
      if (title || description) {
        try {
          localStorage.setItem(
            DRAFT_KEY,
            JSON.stringify({ title, category, folderId, description })
          );
        } catch {}
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [title, category, folderId, description, draftLoaded]);

  function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      let pdfUrl = "";
      let pdfFilename = "";

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

      const noteRes = await fetch("/api/notes", {
        method: "POST",
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
        let msg = "Failed to create note";
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/admin/dashboard"
        className="text-sm text-muted hover:text-foreground"
      >
        &larr; Back to dashboard
      </Link>

      <div className="mt-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Note</h1>
          <p className="mt-1 text-sm text-muted">
            Upload a PDF and write an explanation.
          </p>
        </div>
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
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
            Title
          </label>
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
            <label htmlFor="category" className="mb-1.5 block text-sm font-medium">
              Category
            </label>
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
            <label htmlFor="folder" className="mb-1.5 block text-sm font-medium">
              Folder
            </label>
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
          <label htmlFor="pdf" className="mb-1.5 block text-sm font-medium">
            PDF File
          </label>
          <input
            id="pdf"
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-muted file:mr-3 file:rounded-lg file:border file:border-border file:bg-card file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-background"
          />
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
            {submitting ? "Creating..." : "Create Note"}
          </button>
          <Link href="/admin/dashboard" className="text-sm text-muted hover:text-foreground">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function NewNotePage() {
  return (
    <AdminGuard>
      <NewNoteContent />
    </AdminGuard>
  );
}
