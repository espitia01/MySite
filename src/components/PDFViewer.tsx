export function PDFViewer({ url, filename }: { url: string; filename: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border bg-card px-3 py-2 sm:px-4 sm:py-2.5">
        <span className="truncate text-sm text-muted">{filename}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-sm font-medium text-foreground underline underline-offset-2 hover:text-muted"
        >
          Open PDF
        </a>
      </div>
      <iframe
        src={url}
        className="h-[50vh] w-full sm:h-[70vh]"
        title={filename}
      />
    </div>
  );
}
