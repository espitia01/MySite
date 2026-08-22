"use client";

import {
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type ClipboardEvent,
  type RefObject,
} from "react";
import { uploadFile } from "@/lib/upload";
import { Markdown } from "@/components/Markdown";
import { countWords, readingMinutes } from "@/lib/markdown";

type ViewMode = "write" | "split" | "preview";

export function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [tab, setTab] = useState<ViewMode>("write");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function focusAndSelect(start: number, end: number) {
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.selectionStart = start;
      textarea.selectionEnd = end;
      textarea.focus();
    });
  }

  function applyWrap(before: string, after: string, placeholder: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + before + placeholder + after);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const prev = value.slice(Math.max(0, start - before.length), start);
    const next = value.slice(end, end + after.length);

    if (prev === before && next === after) {
      const nextValue =
        value.slice(0, start - before.length) +
        selected +
        value.slice(end + after.length);
      onChange(nextValue);
      focusAndSelect(start - before.length, end - before.length);
      return;
    }

    const text = selected || placeholder;
    const nextValue =
      value.slice(0, start) + before + text + after + value.slice(end);
    onChange(nextValue);
    focusAndSelect(start + before.length, start + before.length + text.length);
  }

  function applyLinePrefix(prefix: string, toggleHeading = false) {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(`${prefix}${value}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEndIndex = value.indexOf("\n", end);
    const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
    const block = value.slice(lineStart, lineEnd);
    const lines = block.split("\n");

    const updated = lines
      .map((line) => {
        if (toggleHeading) {
          const stripped = line.replace(/^#{1,6}\s+/, "");
          return line.startsWith(prefix) ? stripped : prefix + stripped;
        }
        if (line.startsWith(prefix)) return line.slice(prefix.length);
        return prefix + line;
      })
      .join("\n");

    const nextValue = value.slice(0, lineStart) + updated + value.slice(lineEnd);
    onChange(nextValue);
    focusAndSelect(lineStart, lineStart + updated.length);
  }

  function insertBlock(text: string, selectOffset = 0, selectLength = 0) {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + (value && !value.endsWith("\n") ? "\n" : "") + text);
      return;
    }

    const start = textarea.selectionStart;
    const before = value.slice(0, start);
    const after = value.slice(textarea.selectionEnd);
    const pad = before.length > 0 && !before.endsWith("\n") ? "\n" : "";
    const insert = pad + text;
    onChange(before + insert + after);
    const cursor = start + pad.length + selectOffset;
    focusAndSelect(cursor, cursor + selectLength);
  }

  function indent(forward: boolean) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEndIndex = value.indexOf("\n", end);
    const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
    const block = value.slice(lineStart, lineEnd);
    const lines = block.split("\n");

    const updated = lines
      .map((line) =>
        forward ? `  ${line}` : line.replace(/^ {1,2}/, "")
      )
      .join("\n");

    onChange(value.slice(0, lineStart) + updated + value.slice(lineEnd));
    focusAndSelect(lineStart, lineStart + updated.length);
  }

  function insertLink() {
    const url = window.prompt("Link URL", "https://");
    if (!url) return;
    applyWrap("[", `](${url})`, "link text");
  }

  async function handleImageUpload(file: File) {
    if (file.size > 16 * 1024 * 1024) {
      alert("Image must be under 16 MB");
      return;
    }

    setUploading(true);
    try {
      const { url, filename } = await uploadFile(file, "images");
      insertBlock(`![${filename}](${url})\n`, 2, filename.length);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  }

  function handlePaste(e: ClipboardEvent) {
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

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    const mod = e.metaKey || e.ctrlKey;

    if (mod && e.key.toLowerCase() === "b") {
      e.preventDefault();
      applyWrap("**", "**", "bold");
    } else if (mod && e.key.toLowerCase() === "i") {
      e.preventDefault();
      applyWrap("*", "*", "italic");
    } else if (mod && e.key.toLowerCase() === "e") {
      e.preventDefault();
      applyWrap("`", "`", "code");
    } else if (mod && e.key.toLowerCase() === "k") {
      e.preventDefault();
      insertLink();
    } else if (e.key === "Tab") {
      e.preventDefault();
      indent(!e.shiftKey);
    }
  }

  const words = countWords(value);
  const minutes = value.trim() ? readingMinutes(value) : 0;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(26,24,20,0.03)]">
      <div className="flex flex-wrap items-center gap-1 border-b border-border px-2 py-1.5">
        <div className="flex items-center rounded-lg bg-paper/70 p-0.5">
          {(
            [
              ["write", "Write"],
              ["split", "Split"],
              ["preview", "Preview"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTab(mode)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                mode === "split" ? "hidden sm:inline-flex" : ""
              } ${
                tab === mode
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mx-1 hidden h-5 w-px bg-border sm:block" />

        <ToolbarButton title="Heading 1" onClick={() => applyLinePrefix("# ", true)}>
          H1
        </ToolbarButton>
        <ToolbarButton title="Heading 2" onClick={() => applyLinePrefix("## ", true)}>
          H2
        </ToolbarButton>
        <ToolbarButton title="Heading 3" onClick={() => applyLinePrefix("### ", true)}>
          H3
        </ToolbarButton>

        <div className="mx-0.5 hidden h-5 w-px bg-border sm:block" />

        <ToolbarButton title="Bold (⌘B)" onClick={() => applyWrap("**", "**", "bold")}>
          <span className="font-serif font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton title="Italic (⌘I)" onClick={() => applyWrap("*", "*", "italic")}>
          <span className="font-serif italic">I</span>
        </ToolbarButton>
        <ToolbarButton
          title="Strikethrough"
          onClick={() => applyWrap("~~", "~~", "text")}
        >
          <span className="line-through">S</span>
        </ToolbarButton>
        <ToolbarButton title="Inline code (⌘E)" onClick={() => applyWrap("`", "`", "code")}>
          {"</>"}
        </ToolbarButton>

        <div className="mx-0.5 hidden h-5 w-px bg-border sm:block" />

        <ToolbarButton title="Quote" onClick={() => applyLinePrefix("> ")}>
          “ ”
        </ToolbarButton>
        <ToolbarButton title="Bullet list" onClick={() => applyLinePrefix("- ")}>
          •
        </ToolbarButton>
        <ToolbarButton title="Numbered list" onClick={() => applyLinePrefix("1. ")}>
          1.
        </ToolbarButton>
        <ToolbarButton
          title="Task list"
          onClick={() => applyLinePrefix("- [ ] ")}
        >
          ☐
        </ToolbarButton>

        <div className="mx-0.5 hidden h-5 w-px bg-border sm:block" />

        <ToolbarButton title="Link (⌘K)" onClick={insertLink}>
          Link
        </ToolbarButton>
        <ToolbarButton
          title="Insert image"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? "…" : "Image"}
        </ToolbarButton>
        <ToolbarButton
          title="Table"
          onClick={() =>
            insertBlock(
              "| Column 1 | Column 2 |\n| --- | --- |\n|  |  |\n",
              2,
              8
            )
          }
        >
          Table
        </ToolbarButton>
        <ToolbarButton
          title="Code block"
          onClick={() => insertBlock("```\ncode\n```\n", 4, 4)}
        >
          Block
        </ToolbarButton>
        <ToolbarButton
          title="Inline math"
          onClick={() => applyWrap("$", "$", "x")}
        >
          \(x\)
        </ToolbarButton>
        <ToolbarButton
          title="Block math"
          onClick={() => insertBlock("$$\nE = mc^2\n$$\n", 3, 8)}
        >
          ∑
        </ToolbarButton>
        <ToolbarButton title="Divider" onClick={() => insertBlock("---\n")}>
          —
        </ToolbarButton>

        <div className="relative ml-auto">
          <ToolbarButton
            title="Markdown shortcuts"
            onClick={() => setShowHelp((open) => !open)}
          >
            ?
          </ToolbarButton>
          {showHelp && (
            <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-border bg-card p-3 text-xs leading-relaxed text-muted shadow-lg">
              <p className="mb-2 font-medium text-foreground">Shortcuts</p>
              <ul className="space-y-1">
                <li>
                  <kbd className="rounded bg-paper px-1.5 py-0.5 font-mono">⌘B</kbd>{" "}
                  bold ·{" "}
                  <kbd className="rounded bg-paper px-1.5 py-0.5 font-mono">⌘I</kbd>{" "}
                  italic
                </li>
                <li>
                  <kbd className="rounded bg-paper px-1.5 py-0.5 font-mono">⌘E</kbd>{" "}
                  code ·{" "}
                  <kbd className="rounded bg-paper px-1.5 py-0.5 font-mono">⌘K</kbd>{" "}
                  link
                </li>
                <li>
                  <kbd className="rounded bg-paper px-1.5 py-0.5 font-mono">Tab</kbd>{" "}
                  indent selected lines
                </li>
                <li>Paste or drop images to upload</li>
                <li>
                  Math: <code>$x$</code> or <code>$$E=mc^2$$</code>
                </li>
              </ul>
            </div>
          )}
        </div>

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

      {tab === "write" && (
        <EditorPane
          textareaRef={textareaRef}
          value={value}
          onChange={onChange}
          dragging={dragging}
          setDragging={setDragging}
          onDrop={handleDrop}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
        />
      )}

      {tab === "preview" && (
        <div className="min-h-[360px] p-5 sm:p-6">
          {value.trim() ? (
            <Markdown>{value}</Markdown>
          ) : (
            <p className="text-sm text-muted">Nothing to preview yet.</p>
          )}
        </div>
      )}

      {tab === "split" && (
        <div className="grid min-h-[420px] sm:grid-cols-2">
          <div className="border-b border-border sm:border-b-0 sm:border-r">
            <EditorPane
              textareaRef={textareaRef}
              value={value}
              onChange={onChange}
              dragging={dragging}
              setDragging={setDragging}
              onDrop={handleDrop}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              compact
            />
          </div>
          <div className="max-h-[70vh] overflow-auto p-5">
            {value.trim() ? (
              <Markdown>{value}</Markdown>
            ) : (
              <p className="text-sm text-muted">Start writing to see a preview.</p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted">
        <span>
          {words} {words === 1 ? "word" : "words"}
          {minutes > 0 ? ` · ${minutes} min read` : ""}
        </span>
        <span className="hidden sm:inline">
          Markdown, GitHub-flavored, and LaTeX math
        </span>
      </div>
    </div>
  );
}

function ToolbarButton({
  title,
  onClick,
  disabled,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className="toolbar-btn"
    >
      {children}
    </button>
  );
}

function EditorPane({
  textareaRef,
  value,
  onChange,
  dragging,
  setDragging,
  onDrop,
  onPaste,
  onKeyDown,
  compact,
}: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  dragging: boolean;
  setDragging: (value: boolean) => void;
  onDrop: (e: DragEvent) => void;
  onPaste: (e: ClipboardEvent) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  compact?: boolean;
}) {
  return (
    <div
      className="relative"
      onDragEnter={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={onPaste}
        onKeyDown={onKeyDown}
        placeholder="Write your explanation in Markdown. Use the toolbar, or paste and drop images."
        className={`w-full resize-y bg-transparent p-5 font-mono text-[13px] leading-7 text-foreground outline-none placeholder:text-muted/70 ${
          compact ? "min-h-[420px]" : "min-h-[360px]"
        }`}
      />
      {dragging && (
        <div className="pointer-events-none absolute inset-3 flex items-center justify-center rounded-lg border-2 border-dashed border-accent/40 bg-accent/5 text-sm font-medium text-accent">
          Drop image to insert
        </div>
      )}
    </div>
  );
}
