import Link from "next/link";
import { NoteWithFolder, CATEGORY_LABELS } from "@/lib/types";
import { excerptFromMarkdown } from "@/lib/markdown";
import { Badge } from "@/components/Badge";

export function NoteCard({ note }: { note: NoteWithFolder }) {
  const date = new Date(note.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const excerpt = excerptFromMarkdown(note.description || "", 150);

  return (
    <Link
      href={`/notes/${note.id}`}
      className="surface surface-hover group flex h-full flex-col p-5"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge>{CATEGORY_LABELS[note.category]}</Badge>
        {note.folders && <Badge variant="outline">{note.folders.name}</Badge>}
        {note.pdf_url && <Badge variant="outline">PDF</Badge>}
      </div>
      <h3 className="font-serif text-lg font-semibold leading-snug tracking-tight group-hover:text-accent">
        {note.title}
      </h3>
      {excerpt && (
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
          {excerpt}
        </p>
      )}
      <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-muted">
        {date}
      </p>
    </Link>
  );
}
