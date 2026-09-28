import Link from "next/link";
import { NoteWithFolder, CATEGORY_SINGULAR } from "@/lib/types";
import { formatDate } from "@/lib/site";
import { PDFViewer } from "@/components/PDFViewer";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export function NoteArticle({
  note,
  notice,
}: {
  note: NoteWithFolder;
  notice?: React.ReactNode;
}) {
  const updated =
    new Date(note.updated_at).toDateString() !== new Date(note.created_at).toDateString();

  return (
    <article className="mx-auto max-w-3xl px-5 sm:px-6">
      {notice}
      <header className="pb-10 pt-12 sm:pt-16">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <Link href="/notes" className="transition-colors hover:text-foreground">
            Notes
          </Link>
          {note.folders && (
            <>
              <span className="text-subtle" aria-hidden>
                /
              </span>
              <Link
                href={`/folders/${note.folders.id}`}
                className="transition-colors hover:text-foreground"
              >
                {note.folders.name}
              </Link>
            </>
          )}
        </nav>
        <h1 className="mt-4 font-serif text-[2.125rem] font-semibold leading-[1.15] tracking-tight sm:text-[2.625rem]">
          {note.title}
        </h1>
        <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          <span>{CATEGORY_SINGULAR[note.category]}</span>
          <span className="text-subtle" aria-hidden>
            &middot;
          </span>
          <time dateTime={note.created_at}>{formatDate(note.created_at)}</time>
          {updated && (
            <>
              <span className="text-subtle" aria-hidden>
                &middot;
              </span>
              <span>
                Updated <time dateTime={note.updated_at}>{formatDate(note.updated_at)}</time>
              </span>
            </>
          )}
        </p>
      </header>

      {note.pdf_url && <PDFViewer url={note.pdf_url} filename={note.pdf_filename} />}

      {note.description && (
        <div className={note.pdf_url ? "mt-14 border-t border-border pt-12" : "border-t border-border pt-10"}>
          <MarkdownRenderer source={note.description} />
        </div>
      )}

      <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm">
        <Link href="/notes" className="text-muted transition-colors hover:text-foreground">
          &larr; All notes
        </Link>
        {note.folders && (
          <Link
            href={`/folders/${note.folders.id}`}
            className="text-muted transition-colors hover:text-foreground"
          >
            More in {note.folders.name} &rarr;
          </Link>
        )}
      </footer>
    </article>
  );
}
