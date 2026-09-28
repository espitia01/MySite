import type { Metadata } from "next";
import { getFoldersWithCounts } from "@/lib/queries";
import { FolderList } from "@/components/FolderList";
import { EmptyState, PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Folders",
  description: "Notes organized by subject and topic.",
};

export default async function FoldersPage() {
  const folders = await getFoldersWithCounts();

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-6">
      <PageHeader title="Folders" description="Notes organized by subject and topic." />
      {folders.length > 0 ? (
        <FolderList folders={folders} />
      ) : (
        <EmptyState>No folders yet.</EmptyState>
      )}
    </div>
  );
}
