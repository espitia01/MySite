import Link from "next/link";
import { NoteWithFolder, CATEGORY_SINGULAR } from "@/lib/types";
import { formatDate } from "@/lib/site";
import { noteExcerpt } from "@/lib/excerpt";
import { MarkdownExcerpt } from "@/components/MarkdownRenderer";

export function NoteList({
  notes,
  groupByYear = false,
  showFolder = true,
}: {
  notes: NoteWithFolder[];
  groupByYear?: boolean;
  showFolder?: boolean;
}) {
  if (!groupByYear) {
    return (
      <ol>
        {notes.map((note) => (
          <NoteRow key={note.id} note={note} showFolder={showFolder} dateStyle="short" />
        ))}
      </ol>
    );
  }

  const years = new Map<number, NoteWithFolder[]>();
  for (const note of notes) {
    const year = new Date(note.created_at).getFullYear();
    years.set(year, [...(years.get(year) ?? []), note]);
  }

  return (
    <div className="space-y-12">
      {[...years].map(([year, items]) => (
        <section key={year} aria-labelledby={`year-${year}`}>
          <h2
            id={`year-${year}`}
            className="border-b border-border pb-2 font-mono text-xs tracking-wide text-subtle"
          >
            {year}
          </h2>
          <ol>
            {items.map((note) => (
              <NoteRow key={note.id} note={note} showFolder={showFolder} dateStyle="monthDay" />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function NoteRow({
  note,
  showFolder,
  dateStyle,
}: {
  note: NoteWithFolder;
  showFolder: boolean;
  dateStyle: "short" | "monthDay";
}) {
  const excerpt = note.description ? noteExcerpt(note.description) : null;

  return (
    <li className="group relative grid gap-1 border-b border-border py-[1.125rem] last:border-b-0 sm:grid-cols-[6.5rem_1fr] sm:gap-6">
      <time
        dateTime={note.created_at}
        className="pt-[0.3rem] font-mono text-xs tabular-nums text-subtle"
      >
        {formatDate(note.created_at, dateStyle)}
      </time>
      <div className="min-w-0">
        <h3 className="font-serif text-[1.1875rem] font-semibold leading-snug tracking-tight transition-colors group-hover:text-link">
          <Link href={`/notes/${note.id}`} className="after:absolute after:inset-0">
            {note.title}
          </Link>
        </h3>
        {excerpt?.text && (
          <p className="mt-1.5 line-clamp-2 text-[0.9375rem] leading-relaxed text-muted">
            <MarkdownExcerpt text={excerpt.text} macros={excerpt.macros} />
          </p>
        )}
        <p className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-subtle">
          <span>{CATEGORY_SINGULAR[note.category]}</span>
          {note.pdf_url && (
            <>
              <span aria-hidden>&middot;</span>
              <span>PDF</span>
            </>
          )}
          {showFolder && note.folders && (
            <>
              <span aria-hidden>&middot;</span>
              <Link
                href={`/folders/${note.folders.id}`}
                className="relative z-10 transition-colors hover:text-foreground"
              >
                {note.folders.name}
              </Link>
            </>
          )}
        </p>
      </div>
    </li>
  );
}
