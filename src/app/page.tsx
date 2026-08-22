import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { NoteWithFolder, Folder } from "@/lib/types";
import { NoteCard } from "@/components/NoteCard";
import { FolderCard } from "@/components/FolderCard";
import { FeaturedNote } from "@/components/FeaturedNote";

export const dynamic = "force-dynamic";

interface FolderWithCount extends Folder {
  note_count: number;
}

async function getRecentNotes(): Promise<NoteWithFolder[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("notes")
    .select("*, folders(id, name)")
    .eq("is_draft", false)
    .order("created_at", { ascending: false })
    .limit(7);
  return (data as NoteWithFolder[]) || [];
}

async function getFolders(): Promise<FolderWithCount[]> {
  const supabase = getSupabase();
  const [foldersResult, notesResult] = await Promise.all([
    supabase.from("folders").select("*").order("name", { ascending: true }),
    supabase
      .from("notes")
      .select("folder_id")
      .eq("is_draft", false)
      .not("folder_id", "is", null),
  ]);

  const folders = foldersResult.data || [];
  const notes = notesResult.data || [];
  const countMap = new Map<string, number>();
  notes.forEach((n) => {
    if (n.folder_id) {
      countMap.set(n.folder_id, (countMap.get(n.folder_id) || 0) + 1);
    }
  });

  return folders.map((f) => ({
    ...f,
    note_count: countMap.get(f.id) || 0,
  }));
}

export default async function Home() {
  const [notes, folders] = await Promise.all([getRecentNotes(), getFolders()]);

  const featured = notes[0] ?? null;
  const rest = notes.slice(1);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <section className="py-14 sm:py-20">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-highlight">
          Physics notes
        </p>
        <h1 className="mt-3 max-w-2xl font-serif text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Giovanny Espitia&apos;s Notes
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          Textbook notes, papers, lecture summaries, and worked explanations
          from theoretical and computational condensed matter physics.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/notes" className="btn btn-primary">
            Browse all notes
          </Link>
          <Link href="/folders" className="btn btn-secondary">
            View folders
          </Link>
        </div>
      </section>

      {featured && (
        <section className="pb-14 sm:pb-16">
          <FeaturedNote note={featured} />
        </section>
      )}

      {folders.length > 0 && (
        <section className="pb-14 sm:pb-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-serif text-xl font-semibold tracking-tight">
              Folders
            </h2>
            <Link
              href="/folders"
              className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
            >
              All folders
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder) => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section className="pb-16 sm:pb-20">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-serif text-xl font-semibold tracking-tight">
              Recent
            </h2>
            <Link
              href="/notes"
              className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
            >
              All notes
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
