import Link from "next/link";
import { NoteWithFolder, CATEGORY_LABELS } from "@/lib/types";
import { excerptFromMarkdown } from "@/lib/markdown";
import { Badge } from "@/components/Badge";

export function FeaturedNote({ note }: { note: NoteWithFolder }) {
  const date = new Date(note.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const excerpt = excerptFromMarkdown(note.description || "", 280);

  return (
    <Link
      href={`/notes/${note.id}`}
      className="surface surface-hover group relative block overflow-hidden p-6 sm:p-8"
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-accent" />
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-highlight">
        Latest note
      </p>
      <h2 className="mt-3 font-serif text-2xl font-semibold leading-snug tracking-tight group-hover:text-accent sm:text-3xl">
        {note.title}
      </h2>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge>{CATEGORY_LABELS[note.category]}</Badge>
        {note.folders && <Badge variant="outline">{note.folders.name}</Badge>}
        {note.pdf_url && <Badge variant="outline">PDF</Badge>}
        <span className="text-xs text-muted">{date}</span>
      </div>
      {excerpt && (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-[15px]">
          {excerpt}
        </p>
      )}
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-accent">
        Read note
        <span aria-hidden="true">&rarr;</span>
      </span>
    </Link>
  );
}
