export function PDFViewer({ url, filename }: { url: string; filename: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(26,24,20,0.03)]">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <span className="truncate text-sm text-muted">{filename}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          Open PDF
        </a>
      </div>
      <iframe
        src={url}
        className="h-[50vh] w-full bg-paper/40 sm:h-[70vh]"
        title={filename}
      />
    </div>
  );
}
