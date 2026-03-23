"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";
import { NoteWithFolder, CATEGORY_LABELS } from "@/lib/types";

function DashboardContent() {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteWithFolder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notes?drafts=1")
      .then((res) => res.json())
      .then((data) => {
        setNotes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this note?")) return;

    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setNotes(notes.filter((n) => n.id !== id));
    }
  }

  async function handlePublish(note: NoteWithFolder) {
    const res = await fetch(`/api/notes/${note.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: note.title,
        category: note.category,
        description: note.description,
        pdf_url: note.pdf_url,
        pdf_filename: note.pdf_filename,
        folder_id: note.folder_id,
        is_draft: false,
      }),
    });

    if (res.ok) {
      setNotes(
        notes.map((n) => (n.id === note.id ? { ...n, is_draft: false } : n))
      );
    }
  }

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin");
  }

  const drafts = notes.filter((n) => n.is_draft);
  const published = notes.filter((n) => !n.is_draft);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Manage your notes and uploads.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/new"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            New Note
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/admin/folders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted underline underline-offset-4 hover:text-foreground"
        >
          Manage folders &rarr;
        </Link>
      </div>

      {loading ? (
        <div className="mt-16 text-center">
          <p className="text-sm text-muted">Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-muted">No notes yet.</p>
          <Link
            href="/admin/new"
            className="mt-2 inline-block text-sm font-medium underline underline-offset-4"
          >
            Create your first note
          </Link>
        </div>
      ) : (
        <>
          {drafts.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted">
                Drafts ({drafts.length})
              </h2>
              <div className="overflow-x-auto">
                <NoteTable
                  notes={drafts}
                  onDelete={handleDelete}
                  onPublish={handlePublish}
                  showPublish
                />
              </div>
            </div>
          )}

          {published.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted">
                Published ({published.length})
              </h2>
              <div className="overflow-x-auto">
                <NoteTable notes={published} onDelete={handleDelete} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NoteTable({
  notes,
  onDelete,
  onPublish,
  showPublish,
}: {
  notes: NoteWithFolder[];
  onDelete: (id: string) => void;
  onPublish?: (note: NoteWithFolder) => void;
  showPublish?: boolean;
}) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-border text-muted">
          <th className="pb-3 font-medium">Title</th>
          <th className="pb-3 font-medium">Category</th>
          <th className="pb-3 font-medium">Folder</th>
          <th className="pb-3 font-medium">Date</th>
          <th className="pb-3 text-right font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {notes.map((note) => (
          <tr key={note.id} className="border-b border-border">
            <td className="py-3 pr-4">
              <Link
                href={`/admin/edit/${note.id}`}
                className="font-medium hover:underline"
              >
                {note.title}
              </Link>
            </td>
            <td className="py-3 pr-4 text-muted">
              {CATEGORY_LABELS[note.category]}
            </td>
            <td className="py-3 pr-4 text-muted">
              {note.folders?.name || "\u2014"}
            </td>
            <td className="py-3 pr-4 whitespace-nowrap text-muted">
              {new Date(note.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </td>
            <td className="py-3 text-right whitespace-nowrap">
              {showPublish && onPublish && (
                <button
                  onClick={() => onPublish(note)}
                  className="text-green-600 hover:text-green-800"
                >
                  Publish
                </button>
              )}
              <Link
                href={`/admin/edit/${note.id}`}
                className="ml-4 text-muted hover:text-foreground"
              >
                Edit
              </Link>
              <button
                onClick={() => onDelete(note.id)}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function DashboardPage() {
  return (
    <AdminGuard>
      <DashboardContent />
    </AdminGuard>
  );
}
