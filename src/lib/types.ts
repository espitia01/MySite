export interface Folder {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Note {
  id: string;
  title: string;
  category: "textbook" | "paper" | "lecture" | "other";
  description: string;
  pdf_url: string;
  pdf_filename: string;
  folder_id: string | null;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoteWithFolder extends Note {
  folders: Pick<Folder, "id" | "name"> | null;
}

export const CATEGORIES = ["textbook", "paper", "lecture", "other"] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  textbook: "Textbooks",
  paper: "Papers",
  lecture: "Lectures",
  other: "Other",
};
