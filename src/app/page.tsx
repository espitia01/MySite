import Link from "next/link";
import { getFoldersWithCounts, getPublishedNotes } from "@/lib/queries";
import { NoteList } from "@/components/NoteList";
import { FolderList } from "@/components/FolderList";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [notes, allFolders] = await Promise.all([
    getPublishedNotes({ limit: 6 }),
    getFoldersWithCounts(),
  ]);
  const folders = allFolders.filter((f) => f.note_count > 0);

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-6">
      <section className="pb-16 pt-16 sm:pb-20 sm:pt-24">
        <h1 className="max-w-2xl font-serif text-[2.5rem] font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Notes on textbooks, papers, and lectures.
        </h1>
        <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-muted">
          I&apos;m Giovanny Espitia, a Ph.D. student in physics at The University of Texas at
          Austin working on theoretical and computational condensed matter. This is where I keep
          my reading notes and explanations, shared openly in case they help someone else.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <Link
            href="/notes"
            className="inline-flex items-center rounded-md bg-accent px-4 py-2 font-medium text-white transition-opacity hover:opacity-85"
          >
            Browse notes
          </Link>
          <Link href="/about" className="text-muted transition-colors hover:text-foreground">
            About me &rarr;
          </Link>
        </div>
      </section>

      {notes.length > 0 && (
        <section className="pb-16">
          <SectionHeading href="/notes" linkLabel="All notes">
            Recent
          </SectionHeading>
          <NoteList notes={notes} />
        </section>
      )}

      {folders.length > 0 && (
        <section>
          <SectionHeading href="/folders" linkLabel="All folders">
            Folders
          </SectionHeading>
          <FolderList folders={folders} columns={2} />
        </section>
      )}
    </div>
  );
}

function SectionHeading({
  children,
  href,
  linkLabel,
}: {
  children: React.ReactNode;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-baseline justify-between border-b border-foreground/80 pb-3">
      <h2 className="font-serif text-xl font-semibold tracking-tight">{children}</h2>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
      >
        {linkLabel} <span aria-hidden>&rarr;</span>
      </Link>
    </div>
  );
}
