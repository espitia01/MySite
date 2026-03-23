import Link from "next/link";

interface FolderWithCount {
  id: string;
  name: string;
  description: string;
  note_count: number;
}

export function FolderCard({ folder }: { folder: FolderWithCount }) {
  return (
    <Link
      href={`/folders/${folder.id}`}
      className="group block rounded-lg border border-border bg-card p-5 transition-colors hover:border-muted"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm text-muted">
          {folder.note_count} {folder.note_count === 1 ? "note" : "notes"}
        </span>
      </div>
      <h3 className="font-medium leading-snug group-hover:text-accent">
        {folder.name}
      </h3>
      {folder.description && (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
          {folder.description}
        </p>
      )}
    </Link>
  );
}
