import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { Folder, NoteWithFolder } from "@/lib/types";
import { NoteCard } from "@/components/NoteCard";

export const dynamic = "force-dynamic";

async function getFolder(id: string): Promise<Folder | null> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("folders")
    .select("*")
    .eq("id", id)
    .single();
  return data as Folder | null;
}

async function getFolderNotes(folderId: string): Promise<NoteWithFolder[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("notes")
    .select("*, folders(id, name)")
    .eq("folder_id", folderId)
    .eq("is_draft", false)
    .order("created_at", { ascending: false });
  return (data as NoteWithFolder[]) || [];
}

export default async function FolderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const folder = await getFolder(id);

  if (!folder) {
    notFound();
  }

  const notes = await getFolderNotes(id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/folders"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        &larr; All folders
      </Link>

      <div className="mt-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
          Folder
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          {folder.name}
        </h1>
        {folder.description && (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
            {folder.description}
          </p>
        )}
      </div>

      {notes.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <div className="surface mt-12 px-6 py-16 text-center">
          <p className="text-muted">No notes in this folder yet.</p>
        </div>
      )}
    </div>
  );
}
