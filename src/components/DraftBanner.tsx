"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NoteWithFolder, CATEGORY_LABELS } from "@/lib/types";
import { PDFViewer } from "@/components/PDFViewer";
import { Markdown } from "@/components/Markdown";
import { Badge } from "@/components/Badge";
import { readingMinutes } from "@/lib/markdown";

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
      .then((data) => setStatus(data.authenticated ? "admin" : "denied"))
      .catch(() => setStatus("denied"));
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-muted">Loading...</p>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2">
        <h1 className="font-serif text-3xl font-semibold">404</h1>
        <p className="text-muted">This page could not be found.</p>
        <Link href="/" className="mt-2 text-sm underline underline-offset-4">
          Go home
        </Link>
      </div>
    );
  }

  const date = new Date(note.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const minutes = note.description ? readingMinutes(note.description) : 0;

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/notes"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        &larr; Back to notes
      </Link>

      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        This note is a draft and only visible to you.{" "}
        <Link
          href={`/admin/edit/${noteId}`}
          className="font-medium underline underline-offset-2"
        >
          Edit draft
        </Link>
      </div>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{CATEGORY_LABELS[note.category]}</Badge>
          <Badge variant="draft">Draft</Badge>
          {note.folders && (
            <Badge variant="outline">{note.folders.name}</Badge>
          )}
          <span className="text-sm text-muted">{date}</span>
          {minutes > 0 && (
            <span className="text-sm text-muted">· {minutes} min read</span>
          )}
        </div>
        <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          {note.title}
        </h1>
      </header>

      {note.pdf_url && (
        <div className="mt-8">
          <PDFViewer url={note.pdf_url} filename={note.pdf_filename} />
        </div>
      )}

      {note.description && (
        <div className="mt-12">
          <h2 className="mb-5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
            Explanation
          </h2>
          <Markdown>{note.description}</Markdown>
        </div>
      )}
    </article>
  );
}
