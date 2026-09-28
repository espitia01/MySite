import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNote } from "@/lib/queries";
import { plainExcerpt } from "@/lib/excerpt";
import { NoteArticle } from "@/components/NoteArticle";
import { DraftBanner } from "@/components/DraftBanner";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const note = await getNote((await params).id);
  if (!note || note.is_draft) return {};
  const description = note.description ? plainExcerpt(note.description) : undefined;
  return {
    title: note.title,
    description,
    openGraph: { title: note.title, description, type: "article" },
  };
}

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const note = await getNote(id);

  if (!note) notFound();
  if (note.is_draft) return <DraftBanner noteId={note.id} note={note} />;

  return <NoteArticle note={note} />;
}
