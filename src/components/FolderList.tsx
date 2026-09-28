import Link from "next/link";
import type { FolderWithCount } from "@/lib/queries";

export function FolderList({
  folders,
  columns = 1,
}: {
  folders: FolderWithCount[];
  columns?: 1 | 2;
}) {
  return (
    <ul className={`grid ${columns === 2 ? "sm:grid-cols-2 sm:gap-x-10" : ""}`}>
      {folders.map((folder) => (
        <li
          key={folder.id}
          className="group relative flex items-baseline justify-between gap-6 border-b border-border py-4"
        >
          <div className="min-w-0">
            <h3 className="font-serif text-[1.0625rem] font-semibold tracking-tight transition-colors group-hover:text-link">
              <Link href={`/folders/${folder.id}`} className="after:absolute after:inset-0">
                {folder.name}
              </Link>
            </h3>
            {folder.description && (
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
                {folder.description}
              </p>
            )}
          </div>
          <span className="shrink-0 font-mono text-xs tabular-nums text-subtle">
            {folder.note_count} {folder.note_count === 1 ? "note" : "notes"}
          </span>
        </li>
      ))}
    </ul>
  );
}
