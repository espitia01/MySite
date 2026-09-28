export function PDFViewer({ url, filename }: { url: string; filename: string }) {
  return (
    <figure className="overflow-hidden rounded-md border border-border bg-card">
      <figcaption className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5 text-sm">
        <span className="flex min-w-0 items-center gap-2 text-muted">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" className="h-4 w-4 shrink-0" aria-hidden>
            <path d="M9.5 1.5H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5L9.5 1.5Z" />
            <path d="M9.5 1.5V5H13" />
          </svg>
          <span className="truncate">{filename}</span>
        </span>
        <span className="flex shrink-0 items-center gap-4">
          <a
            href={url}
            download={filename}
            className="text-muted transition-colors hover:text-foreground"
          >
            Download
          </a>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-link hover:underline underline-offset-4"
          >
            Open &#8599;
          </a>
        </span>
      </figcaption>
      <iframe src={url} className="block h-[60vh] w-full sm:h-[78vh]" title={filename} />
    </figure>
  );
}
