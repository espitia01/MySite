"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";
import { NoteWithFolder, CATEGORY_LABELS } from "@/lib/types";
import { Badge } from "@/components/Badge";

function DashboardContent() {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteWithFolder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notes?drafts=1")
      .then((res) => res.json())
      .then((data) => {
        setNotes(Array.isArray(data) ? data : []);
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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
            Workspace
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-muted">
            Create, edit, and publish notes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/new" className="btn btn-primary">
            New note
          </Link>
          <button onClick={handleLogout} className="btn btn-secondary">
            Sign out
          </button>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/admin/folders"
          className="text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          Manage folders &rarr;
        </Link>
      </div>

      {loading ? (
        <div className="mt-16 text-center">
          <p className="text-sm text-muted">Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="surface mt-12 px-6 py-16 text-center">
          <p className="font-serif text-lg">No notes yet</p>
          <Link
            href="/admin/new"
            className="mt-3 inline-block text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            Create your first note
          </Link>
        </div>
      ) : (
        <>
          {drafts.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 font-serif text-lg font-semibold">
                Drafts{" "}
                <span className="text-muted">({drafts.length})</span>
              </h2>
              <NoteTable
                notes={drafts}
                onDelete={handleDelete}
                onPublish={handlePublish}
                showPublish
              />
            </div>
          )}

          {published.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 font-serif text-lg font-semibold">
                Published{" "}
                <span className="text-muted">({published.length})</span>
              </h2>
              <NoteTable notes={published} onDelete={handleDelete} />
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
    <div className="surface overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-[11px] uppercase tracking-[0.12em] text-muted">
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Folder</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {notes.map((note) => (
            <tr key={note.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 pr-4">
                <Link
                  href={`/admin/edit/${note.id}`}
                  className="font-medium hover:text-accent"
                >
                  {note.title}
                </Link>
              </td>
              <td className="px-4 py-3 pr-4">
                <Badge>{CATEGORY_LABELS[note.category]}</Badge>
              </td>
              <td className="px-4 py-3 pr-4 text-muted">
                {note.folders?.name || "\u2014"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 pr-4 text-muted">
                {new Date(note.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                {showPublish && onPublish && (
                  <button
                    onClick={() => onPublish(note)}
                    className="text-sm text-accent hover:underline"
                  >
                    Publish
                  </button>
                )}
                <Link
                  href={`/admin/edit/${note.id}`}
                  className="ml-4 text-sm text-muted hover:text-foreground"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(note.id)}
                  className="ml-4 text-sm text-danger hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AdminGuard>
      <DashboardContent />
    </AdminGuard>
  );
}
