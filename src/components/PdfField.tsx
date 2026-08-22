"use client";

import { useState } from "react";

export function PdfField({
  file,
  onFile,
  currentFilename,
}: {
  file: File | null;
  onFile: (file: File | null) => void;
  currentFilename?: string;
}) {
  const [dragging, setDragging] = useState(false);
  const label = file?.name || currentFilename;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">PDF file</label>
      <label
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const next = e.dataTransfer.files[0];
          if (next && next.type === "application/pdf") onFile(next);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center transition-colors ${
          dragging
            ? "border-accent bg-accent/5"
            : "border-border bg-card hover:border-muted hover:bg-paper/40"
        }`}
      >
        <span className="text-sm font-medium">
          {label ? "Replace PDF" : "Drop a PDF or browse"}
        </span>
        <span className="mt-1 text-xs text-muted">
          {label ? label : "Up to 16 MB"}
        </span>
        <input
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] || null)}
        />
      </label>
      {currentFilename && !file && (
        <p className="mt-2 text-xs text-muted">
          Leave empty to keep the current PDF.
        </p>
      )}
    </div>
  );
}
