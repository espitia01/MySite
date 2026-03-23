"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";
import { Folder } from "@/lib/types";

interface FolderWithCount extends Folder {
  note_count: number;
}

function FoldersContent() {
  const [folders, setFolders] = useState<FolderWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFolders();
  }, []);

  async function fetchFolders() {
    const res = await fetch("/api/folders");
    const data = await res.json();
    setFolders(data);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() }),
    });

    if (res.ok) {
      setName("");
      setDescription("");
      await fetchFolders();
    }
    setSubmitting(false);
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;
    setSubmitting(true);

    const res = await fetch(`/api/folders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName.trim(),
        description: editDescription.trim(),
      }),
    });

    if (res.ok) {
      setEditingId(null);
      await fetchFolders();
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this folder? Notes inside will be unassigned, not deleted."))
      return;

    const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
    if (res.ok) {
      setFolders(folders.filter((f) => f.id !== id));
    }
  }

  function startEdit(folder: FolderWithCount) {
    setEditingId(folder.id);
    setEditName(folder.name);
    setEditDescription(folder.description || "");
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/admin/dashboard"
        className="text-sm text-muted hover:text-foreground"
      >
        &larr; Back to dashboard
      </Link>

      <h1 className="mt-6 text-2xl font-bold tracking-tight">Folders</h1>
      <p className="mt-1 text-sm text-muted">
        Create and manage folders to organize your notes.
      </p>

      <form onSubmit={handleCreate} className="mt-8 space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Folder name"
            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-foreground"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Create
          </button>
        </div>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-foreground"
        />
      </form>

      {loading ? (
        <p className="mt-12 text-center text-sm text-muted">
          Loading folders...
        </p>
      ) : folders.length === 0 ? (
        <p className="mt-12 text-center text-muted">No folders yet.</p>
      ) : (
        <div className="mt-8 space-y-2">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="rounded-lg border border-border p-4"
            >
              {editingId === folder.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-foreground"
                  />
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-foreground"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(folder.id)}
                      disabled={submitting}
                      className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs text-muted hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{folder.name}</p>
                    <p className="text-sm text-muted">
                      {folder.description
                        ? `${folder.description} · `
                        : ""}
                      {folder.note_count}{" "}
                      {folder.note_count === 1 ? "note" : "notes"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <button
                      onClick={() => startEdit(folder)}
                      className="text-muted hover:text-foreground"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(folder.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminFoldersPage() {
  return (
    <AdminGuard>
      <FoldersContent />
    </AdminGuard>
  );
}
