import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getSupabase } from "@/lib/supabase";
import { NoteWithFolder, CATEGORY_LABELS } from "@/lib/types";
import { PDFViewer } from "@/components/PDFViewer";
import { DraftBanner } from "@/components/DraftBanner";

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/notes"
        className="text-sm text-muted hover:text-foreground"
      >
        &larr; Back to notes
      </Link>

      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-card border border-border px-2.5 py-0.5 text-xs font-medium text-muted">
            {CATEGORY_LABELS[note.category]}
          </span>
          {note.folders && (
            <Link
              href={`/folders/${note.folders.id}`}
              className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted transition-colors hover:border-muted hover:text-foreground"
            >
              {note.folders.name}
            </Link>
          )}
          <span className="text-sm text-muted">{date}</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          {note.title}
        </h1>
      </div>

      {note.pdf_url && (
        <div className="mt-8">
          <PDFViewer url={note.pdf_url} filename={note.pdf_filename} />
        </div>
      )}

      {note.description && (
        <div className="mt-10">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted">
            Explanation
          </h2>
          <div className="prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {note.description}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
