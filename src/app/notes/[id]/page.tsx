import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { NoteWithFolder, CATEGORY_LABELS } from "@/lib/types";
import { PDFViewer } from "@/components/PDFViewer";
import { DraftBanner } from "@/components/DraftBanner";
import { Markdown } from "@/components/Markdown";
import { Badge } from "@/components/Badge";
import { readingMinutes } from "@/lib/markdown";

export const dynamic = "force-dynamic";

async function getNote(id: string): Promise<NoteWithFolder | null> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("notes")
    .select("*, folders(id, name)")
    .eq("id", id)
    .single();
  return data as NoteWithFolder | null;
}

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const note = await getNote(id);

  if (!note) {
    notFound();
  }

  if (note.is_draft) {
    return <DraftBanner noteId={note.id} note={note} />;
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

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{CATEGORY_LABELS[note.category]}</Badge>
          {note.folders && (
            <Link href={`/folders/${note.folders.id}`}>
              <Badge variant="outline">{note.folders.name}</Badge>
            </Link>
          )}
          <span className="text-sm text-muted">{date}</span>
          {minutes > 0 && (
            <span className="text-sm text-muted">· {minutes} min read</span>
          )}
        </div>
        <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
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
