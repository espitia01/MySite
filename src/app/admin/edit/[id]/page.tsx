"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { PdfField } from "@/components/PdfField";
import { Badge } from "@/components/Badge";
import { Folder, NoteWithFolder, CATEGORIES, CATEGORY_LABELS } from "@/lib/types";
import { uploadFile } from "@/lib/upload";

function EditNoteContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [isDraft, setIsDraft] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("textbook");
  const [folderId, setFolderId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [currentPdf, setCurrentPdf] = useState("");
  const [currentPdfFilename, setCurrentPdfFilename] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/notes/${id}`).then((r) => r.json()),
      fetch("/api/folders").then((r) => r.json()),
    ])
      .then(([note, foldersData]: [NoteWithFolder, Folder[]]) => {
        setFolders(Array.isArray(foldersData) ? foldersData : []);
        setTitle(note.title);
        setCategory(note.category);
        setFolderId(note.folder_id || "");
        setDescription(note.description || "");
        setCurrentPdf(note.pdf_url || "");
        setCurrentPdfFilename(note.pdf_filename || "");
        setIsDraft(note.is_draft);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load note");
        setLoading(false);
      });
  }, [id]);

  async function uploadPdf(): Promise<{ url: string; filename: string }> {
    if (!file) return { url: currentPdf, filename: currentPdfFilename };
    return uploadFile(file, "pdfs");
  }

  async function handleSave(asDraft: boolean) {
    setError("");
    if (asDraft) setSaving(true);
    else setSubmitting(true);

    try {
      if (!title.trim()) throw new Error("Title is required");

      const { url: pdfUrl, filename: pdfFilename } = await uploadPdf();

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
          is_draft: asDraft,
        }),
      });

      if (!noteRes.ok) {
        let msg = "Failed to update note";
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

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-muted">Loading note...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/admin/dashboard"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        &larr; Back to dashboard
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Edit note
        </h1>
        {isDraft && <Badge variant="draft">Draft</Badge>}
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

        <PdfField
          file={file}
          onFile={setFile}
          currentFilename={currentPdfFilename}
        />

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
          {isDraft ? (
            <>
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
                {saving ? "Saving..." : "Save draft"}
              </button>
            </>
          ) : (
            <button
              type="submit"
              disabled={submitting || saving}
              className="btn btn-primary"
            >
              {submitting ? "Saving..." : "Save changes"}
            </button>
          )}
          <Link href="/admin/dashboard" className="btn btn-ghost">
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
