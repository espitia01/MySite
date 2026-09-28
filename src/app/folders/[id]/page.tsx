import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getFolder, getPublishedNotes } from "@/lib/queries";
import { NoteList } from "@/components/NoteList";
import { EmptyState, PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const folder = await getFolder((await params).id);
  return folder
    ? { title: folder.name, description: folder.description || undefined }
    : {};
}

export default async function FolderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const folder = await getFolder(id);
  if (!folder) notFound();

  const notes = await getPublishedNotes({ folderId: id });

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-6">
      <PageHeader
        breadcrumb={
          <Link href="/folders" className="transition-colors hover:text-foreground">
            &larr; Folders
          </Link>
        }
        title={folder.name}
        description={folder.description || undefined}
      >
        <p className="mt-4 font-mono text-xs text-subtle">
          {notes.length} {notes.length === 1 ? "note" : "notes"}
        </p>
      </PageHeader>

      {notes.length > 0 ? (
        <NoteList notes={notes} groupByYear showFolder={false} />
      ) : (
        <EmptyState>No notes in this folder yet.</EmptyState>
      )}
    </div>
  );
}
