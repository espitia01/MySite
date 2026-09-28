import { cache } from "react";
import { getSupabase } from "@/lib/supabase";
import { Folder, NoteWithFolder } from "@/lib/types";

export interface FolderWithCount extends Folder {
  note_count: number;
}

export async function getPublishedNotes(options: { limit?: number; folderId?: string } = {}) {
  let query = getSupabase()
    .from("notes")
    .select("*, folders(id, name)")
    .eq("is_draft", false)
    .order("created_at", { ascending: false });
  if (options.folderId) query = query.eq("folder_id", options.folderId);
  if (options.limit) query = query.limit(options.limit);
  const { data } = await query;
  return (data as NoteWithFolder[]) || [];
}

export async function getFoldersWithCounts(): Promise<FolderWithCount[]> {
  const supabase = getSupabase();
  const [foldersResult, notesResult] = await Promise.all([
    supabase.from("folders").select("*").order("name", { ascending: true }),
    supabase
      .from("notes")
      .select("folder_id")
      .eq("is_draft", false)
      .not("folder_id", "is", null),
  ]);

  const counts = new Map<string, number>();
  for (const { folder_id } of notesResult.data || []) {
    if (folder_id) counts.set(folder_id, (counts.get(folder_id) || 0) + 1);
  }

  return (foldersResult.data || []).map((f) => ({
    ...f,
    note_count: counts.get(f.id) || 0,
  }));
}

export const getNote = cache(async (id: string) => {
  const { data } = await getSupabase()
    .from("notes")
    .select("*, folders(id, name)")
    .eq("id", id)
    .single();
  return data as NoteWithFolder | null;
});

export const getFolder = cache(async (id: string) => {
  const { data } = await getSupabase()
    .from("folders")
    .select("*")
    .eq("id", id)
    .single();
  return data as Folder | null;
});
