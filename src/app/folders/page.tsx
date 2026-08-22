import { getSupabase } from "@/lib/supabase";
import { Folder } from "@/lib/types";
import { FolderCard } from "@/components/FolderCard";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

interface FolderWithCount extends Folder {
  note_count: number;
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

export default async function FoldersPage() {
  const folders = await getFolders();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        eyebrow="Collections"
        title="Folders"
        description="Notes grouped by subject and topic."
      />

      {folders.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <FolderCard key={folder.id} folder={folder} />
          ))}
        </div>
      ) : (
        <div className="surface mt-12 px-6 py-16 text-center">
          <p className="font-serif text-lg">No folders yet</p>
          <p className="mt-1 text-sm text-muted">
            Folders will appear here once they are created.
          </p>
        </div>
      )}
    </div>
  );
}
