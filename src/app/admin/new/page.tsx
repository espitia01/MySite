"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { Folder, CATEGORIES, CATEGORY_LABELS } from "@/lib/types";

function NewNoteContent() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("textbook");
  const [folderId, setFolderId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    fetch("/api/folders")
      .then((res) => res.json())
      .then(setFolders)
      .catch(() => {});
  }, []);

  async function uploadPdf(): Promise<{ url: string; filename: string }> {
    if (!file) return { url: "", filename: "" };

    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      let msg = "Upload failed";
      try {
        const d = await uploadRes.json();
        msg = d.error || msg;
      } catch {}
      throw new Error(msg);
    }

    const uploadData = await uploadRes.json();
    return { url: uploadData.url, filename: uploadData.filename };
  }

  async function handleSave(asDraft: boolean) {
    setError("");
    if (asDraft) setSaving(true);
    else setSubmitting(true);

    try {
      if (!title.trim()) throw new Error("Title is required");

      const { url: pdfUrl, filename: pdfFilename } = await uploadPdf();

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
          is_draft: asDraft,
        }),
      });

      if (!noteRes.ok) {
        let msg = "Failed to create note";
        try {
          const d = await noteRes.json();
          msg = d.error || msg;
        } catch {}
        throw new Error(msg);
      }

      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
      setSaving(false);
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

      <div className="mt-6">
        <h1 className="text-2xl font-bold tracking-tight">New Note</h1>
        <p className="mt-1 text-sm text-muted">
          Upload a PDF and write an explanation.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave(false);
        }}
        className="mt-8 space-y-6"
      >
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
            <label
              htmlFor="category"
              className="mb-1.5 block text-sm font-medium"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-foreground"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="folder"
              className="mb-1.5 block text-sm font-medium"
            >
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
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
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
          <label className="mb-1.5 block text-sm font-medium">
            Explanation
          </label>
          <MarkdownEditor value={description} onChange={setDescription} />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={submitting || saving}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Publishing..." : "Publish"}
          </button>
          <button
            type="button"
            disabled={submitting || saving}
            onClick={() => handleSave(true)}
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save as Draft"}
          </button>
          <Link
            href="/admin/dashboard"
            className="text-sm text-muted hover:text-foreground"
          >
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
