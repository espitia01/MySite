import Link from "next/link";
import { NoteWithFolder, CATEGORY_LABELS } from "@/lib/types";

export function NoteCard({ note }: { note: NoteWithFolder }) {
  const date = new Date(note.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/notes/${note.id}`}
      className="group block rounded-lg border border-border bg-card p-5 transition-colors hover:border-muted"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-background px-2.5 py-0.5 text-xs font-medium text-muted">
          {CATEGORY_LABELS[note.category]}
        </span>
        {note.folders && (
          <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">
            {note.folders.name}
          </span>
        )}
        <span className="text-xs text-muted">{date}</span>
      </div>
      <h3 className="font-medium leading-snug group-hover:text-accent">
        {note.title}
      </h3>
      {note.description && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
          {note.description.slice(0, 150)}
          {note.description.length > 150 ? "..." : ""}
        </p>
      )}
    </Link>
  );
}
