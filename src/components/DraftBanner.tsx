"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NoteWithFolder } from "@/lib/types";
import { NoteArticle } from "@/components/NoteArticle";

export function DraftBanner({
  noteId,
  note,
}: {
  noteId: string;
  note: NoteWithFolder;
}) {
  const [status, setStatus] = useState<"loading" | "admin" | "denied">(
    "loading"
  );

  useEffect(() => {
    fetch("/api/auth")
      .then((res) => res.json())
      .then((data) =>
        setStatus(data.authenticated ? "admin" : "denied")
      )
      .catch(() => setStatus("denied"));
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-3xl flex-col justify-center px-5 sm:px-6">
        <p className="font-mono text-sm text-subtle">404</p>
        <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          Page not found
        </h1>
        <Link href="/" className="mt-8 text-sm font-medium text-link hover:underline underline-offset-4">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <NoteArticle
      note={note}
      notice={
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span>This note is a draft and only visible to you.</span>
          <Link
            href={`/admin/edit/${noteId}`}
            className="font-medium underline underline-offset-2"
          >
            Edit draft
          </Link>
        </div>
      }
    />
  );
}
