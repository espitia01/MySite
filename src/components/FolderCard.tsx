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
      className="surface surface-hover group flex h-full flex-col p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-paper text-accent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M3.75 3A1.75 1.75 0 002 4.75v10.5c0 .966.784 1.75 1.75 1.75h12.5A1.75 1.75 0 0018 15.25v-8.5A1.75 1.75 0 0016.25 5h-4.836a.25.25 0 01-.177-.073L9.323 3.073A1.75 1.75 0 008.086 2.5H3.75z" />
          </svg>
        </span>
        <span className="text-[11px] uppercase tracking-[0.14em] text-muted">
          {folder.note_count} {folder.note_count === 1 ? "note" : "notes"}
        </span>
      </div>
      <h3 className="font-serif text-lg font-semibold leading-snug tracking-tight group-hover:text-accent">
        {folder.name}
      </h3>
      {folder.description && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
          {folder.description}
        </p>
      )}
    </Link>
  );
}
