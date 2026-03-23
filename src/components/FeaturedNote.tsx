import Link from "next/link";
import { NoteWithFolder, CATEGORY_LABELS } from "@/lib/types";

export function FeaturedNote({ note }: { note: NoteWithFolder }) {
  const date = new Date(note.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link
      href={`/notes/${note.id}`}
      className="group block rounded-xl border border-border bg-card p-6 transition-colors hover:border-muted sm:p-8"
    >
      <span className="text-xs font-medium uppercase tracking-wider text-muted">
        Latest
      </span>
      <h2 className="mt-3 text-xl font-bold leading-snug tracking-tight group-hover:text-accent sm:text-2xl">
        {note.title}
      </h2>
      <div className="mt-3 flex flex-wrap items-center gap-2">
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
      {note.description && (
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted sm:text-base sm:leading-relaxed">
          {note.description.slice(0, 300)}
          {note.description.length > 300 ? "..." : ""}
        </p>
      )}
      <span className="mt-4 inline-block text-sm font-medium underline underline-offset-4 group-hover:text-muted">
        Read more &rarr;
      </span>
    </Link>
  );
}
