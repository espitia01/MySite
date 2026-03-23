import { getSupabase } from "@/lib/supabase";
import { Folder } from "@/lib/types";
import { FolderCard } from "@/components/FolderCard";

export const dynamic = "force-dynamic";

interface FolderWithCount extends Folder {
  note_count: number;
}

async function getFolders(): Promise<FolderWithCount[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("folders")
    .select("*, notes(count)")
    .order("name", { ascending: true });

  return (data || []).map((f) => ({
    ...f,
    note_count: (f.notes as { count: number }[])?.[0]?.count ?? 0,
    notes: undefined,
  })) as FolderWithCount[];
}

export default async function FoldersPage() {
  const folders = await getFolders();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-bold tracking-tight">Folders</h1>
      <p className="mt-2 text-muted">
        Notes organized by subject and topic.
      </p>

      {folders.length > 0 ? (
        <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <FolderCard key={folder.id} folder={folder} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-muted">No folders yet.</p>
        </div>
      )}
    </div>
  );
}
