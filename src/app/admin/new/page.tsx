"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { PdfField } from "@/components/PdfField";
import { Folder, CATEGORIES, CATEGORY_LABELS } from "@/lib/types";
import { uploadFile } from "@/lib/upload";

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
      .then((data) => setFolders(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  async function uploadPdf(): Promise<{ url: string; filename: string }> {
    if (!file) return { url: "", filename: "" };
    return uploadFile(file, "pdfs");
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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/admin/dashboard"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        &larr; Back to dashboard
      </Link>

      <div className="mt-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
          Compose
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
          New note
        </h1>
        <p className="mt-2 text-sm text-muted">
          Attach a PDF and write the explanation with a full markdown editor.
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
            className="field"
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
              className="field"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
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
              className="field"
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

        <PdfField file={file} onFile={setFile} />

        <div>
          <label className="mb-1.5 block text-sm font-medium">Explanation</label>
          <MarkdownEditor value={description} onChange={setDescription} />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={submitting || saving}
            className="btn btn-primary"
          >
            {submitting ? "Publishing..." : "Publish"}
          </button>
          <button
            type="button"
            disabled={submitting || saving}
            onClick={() => handleSave(true)}
            className="btn btn-secondary"
          >
            {saving ? "Saving..." : "Save as draft"}
          </button>
          <Link href="/admin/dashboard" className="btn btn-ghost">
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
