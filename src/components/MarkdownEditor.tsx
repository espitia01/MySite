"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(file: File) {
    if (file.size > 16 * 1024 * 1024) {
      alert("Image must be under 16 MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let msg = "Upload failed";
        try {
          const data = await res.json();
          msg = data.error || msg;
        } catch {
          msg = `Upload failed (${res.status})`;
        }
        throw new Error(msg);
      }

      const { url, filename } = await res.json();
      const markdown = `![${filename}](${url})`;
      insertAtCursor(markdown);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  function insertAtCursor(text: string) {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = value.slice(0, start);
      const after = value.slice(end);
      const needsNewline = before.length > 0 && !before.endsWith("\n");
      const insert = (needsNewline ? "\n" : "") + text;
      const newValue = before + insert + after;
      onChange(newValue);
      const cursorPos = start + insert.length;
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = cursorPos;
        textarea.focus();
      });
    } else {
      onChange(value + (value && !value.endsWith("\n") ? "\n" : "") + text);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) handleImageUpload(file);
        return;
      }
    }
  }

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center border-b border-border">
        <button
          type="button"
          onClick={() => setTab("write")}
          className={`px-4 py-2 text-sm transition-colors ${
            tab === "write"
              ? "border-b-2 border-foreground font-medium text-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={`px-4 py-2 text-sm transition-colors ${
            tab === "preview"
              ? "border-b-2 border-foreground font-medium text-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          Preview
        </button>
        <div className="ml-auto pr-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="rounded px-2.5 py-1 text-xs text-muted transition-colors hover:bg-background hover:text-foreground disabled:opacity-50"
            title="Insert image"
          >
            {uploading ? "Uploading..." : "Insert image"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>
      {tab === "write" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onPaste={handlePaste}
          placeholder="Write your explanation in Markdown... You can paste or drag images here."
          className="min-h-[300px] w-full resize-y bg-transparent p-4 text-sm leading-relaxed outline-none placeholder:text-muted"
        />
      ) : (
        <div className="prose min-h-[300px] p-4 text-sm">
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-muted">Nothing to preview.</p>
          )}
        </div>
      )}
    </div>
  );
}
