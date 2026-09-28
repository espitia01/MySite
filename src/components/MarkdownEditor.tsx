"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { uploadFile } from "@/lib/upload";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

type Mode = "write" | "split" | "preview";

const MODES: { id: Mode; label: string }[] = [
  { id: "write", label: "Write" },
  { id: "split", label: "Split" },
  { id: "preview", label: "Preview" },
];

const STORAGE_KEY = "markdown-editor:layout";
const DEFAULT_RATIO = 0.55;

// "{{}}" marks where the current selection (or the placeholder) goes.
const SNIPPETS: {
  group: string;
  items: { id: string; label: string; template: string; placeholder: string }[];
}[] = [
  {
    group: "Math",
    items: [
      {
        id: "equation",
        label: "equation (numbered)",
        template: "\\begin{equation}\n  {{}}\n  \\label{eq:}\n\\end{equation}",
        placeholder: "f(x) = \\int_a^b g(t)\\,dt",
      },
      {
        id: "equation*",
        label: "equation* (unnumbered)",
        template: "\\begin{equation*}\n  {{}}\n\\end{equation*}",
        placeholder: "e^{i\\pi} + 1 = 0",
      },
      {
        id: "align",
        label: "align",
        template: "\\begin{align}\n  {{}} \\\\\n  &= c\n\\end{align}",
        placeholder: "a &= b",
      },
      {
        id: "align*",
        label: "align*",
        template: "\\begin{align*}\n  {{}} \\\\\n  &= c\n\\end{align*}",
        placeholder: "a &= b",
      },
      {
        id: "gather",
        label: "gather",
        template: "\\begin{gather}\n  {{}} \\\\\n  c = d\n\\end{gather}",
        placeholder: "a = b",
      },
      {
        id: "cases",
        label: "cases",
        template:
          "$$\nf(x) = \\begin{cases}\n  {{}} & x \\ge 0 \\\\\n  -x & x < 0\n\\end{cases}\n$$",
        placeholder: "x",
      },
      {
        id: "matrix",
        label: "matrix",
        template: "$$\n\\begin{pmatrix}\n  {{}} & b \\\\\n  c & d\n\\end{pmatrix}\n$$",
        placeholder: "a",
      },
      {
        id: "macro",
        label: "\\newcommand",
        template: "\\newcommand{{{}}}[1]{\\mathbf{#1}}",
        placeholder: "\\vect",
      },
    ],
  },
  {
    group: "Environments",
    items: ["theorem", "lemma", "proposition", "corollary", "definition", "example", "remark"].map(
      (env) => ({
        id: env,
        label: env,
        template: `\\begin{${env}}[Name]\n{{}}\n\\end{${env}}`,
        placeholder: "Statement.",
      })
    ),
  },
  {
    group: "Other",
    items: [
      {
        id: "proof",
        label: "proof",
        template: "\\begin{proof}\n{{}}\n\\end{proof}",
        placeholder: "Argument.",
      },
      {
        id: "table",
        label: "table",
        template: "| {{}} | Column 2 |\n| --- | --- |\n| Cell | Cell |",
        placeholder: "Column 1",
      },
      {
        id: "code",
        label: "code block",
        template: "```python\n{{}}\n```",
        placeholder: "print('hello')",
      },
    ],
  },
];

function readLayout(): { mode: Mode; ratio: number } {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return {
      mode: MODES.some((m) => m.id === saved.mode) ? saved.mode : "split",
      ratio: typeof saved.ratio === "number" ? saved.ratio : DEFAULT_RATIO,
    };
  } catch {
    return { mode: "split", ratio: DEFAULT_RATIO };
  }
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

export function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [mode, setMode] = useState<Mode>(() => readLayout().mode);
  const [ratio, setRatio] = useState(() => readLayout().ratio);
  const [fullscreen, setFullscreen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [syncScroll, setSyncScroll] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [uploading, setUploading] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const deferredValue = useDeferredValue(value);
  const preview = useMemo(
    () =>
      deferredValue.trim() ? (
        <MarkdownRenderer source={deferredValue} />
      ) : (
        <p className="text-sm text-muted">Nothing to preview.</p>
      ),
    [deferredValue]
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, ratio }));
  }, [mode, ratio]);

  // ---------------------------------------------------------------------------
  // Full screen: native Fullscreen API when available, fixed overlay otherwise.

  const exitFullscreen = useCallback(() => {
    setFullscreen(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);

  async function enterFullscreen() {
    setFullscreen(true);
    try {
      await rootRef.current?.requestFullscreen?.();
    } catch {
      // The overlay alone still covers the window.
    }
  }

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) setFullscreen(false);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.fullscreenElement) exitFullscreen();
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [fullscreen, exitFullscreen]);

  // ---------------------------------------------------------------------------
  // Scroll sync (editor drives preview).

  const syncPreview = useCallback(() => {
    const ta = textareaRef.current;
    const pv = previewRef.current;
    if (!ta || !pv || !syncScroll) return;
    const max = ta.scrollHeight - ta.clientHeight;
    const position =
      max > 0 ? ta.scrollTop / max : ta.selectionStart / Math.max(1, ta.value.length);
    pv.scrollTop = position * (pv.scrollHeight - pv.clientHeight);
  }, [syncScroll]);

  useEffect(() => {
    if (mode === "split") syncPreview();
  }, [preview, mode, ratio, fullscreen, syncPreview]);

  // ---------------------------------------------------------------------------
  // Text manipulation. execCommand keeps the browser's native undo stack intact.

  function replaceRange(
    start: number,
    end: number,
    text: string,
    selectFrom = text.length,
    selectTo = selectFrom
  ) {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.focus();
    ta.setSelectionRange(start, end);
    const inserted = document.execCommand("insertText", false, text);
    if (!inserted) onChange(ta.value.slice(0, start) + text + ta.value.slice(end));
    requestAnimationFrame(() => {
      ta.setSelectionRange(start + selectFrom, start + selectTo);
    });
  }

  function wrapSelection(before: string, after: string, placeholder: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e } = ta;
    const selected = ta.value.slice(s, e) || placeholder;
    replaceRange(
      s,
      e,
      before + selected + after,
      before.length,
      before.length + selected.length
    );
  }

  function transformLines(transform: (lines: string[]) => string[]) {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value: v } = ta;
    const start = v.lastIndexOf("\n", s - 1) + 1;
    const endIdx = v.indexOf("\n", e > s && v[e - 1] === "\n" ? e - 1 : e);
    const end = endIdx < 0 ? v.length : endIdx;
    const next = transform(v.slice(start, end).split("\n")).join("\n");
    replaceRange(start, end, next, s === e ? next.length : 0, next.length);
  }

  function toggleLinePrefix(pattern: RegExp, prefix: (i: number) => string) {
    transformLines((lines) =>
      lines.every((l) => pattern.test(l))
        ? lines.map((l) => l.replace(pattern, ""))
        : lines.map((l, i) => prefix(i) + l.replace(pattern, ""))
    );
  }

  function insertBlock(template: string, placeholder: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value: v } = ta;
    const before = v.slice(0, s);
    const after = v.slice(e);
    const selected = v.slice(s, e) || placeholder;
    const [pre, post = ""] = template.split("{{}}");
    const lead = !before || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
    const trail = !after || after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n";
    const from = lead.length + pre.length;
    replaceRange(s, e, lead + pre + selected + post + trail, from, from + selected.length);
  }

  function insertSnippet(id: string) {
    const snippet = SNIPPETS.flatMap((g) => g.items).find((s) => s.id === id);
    if (snippet) insertBlock(snippet.template, snippet.placeholder);
  }

  const actions = {
    bold: () => wrapSelection("**", "**", "bold text"),
    italic: () => wrapSelection("*", "*", "italic text"),
    code: () => wrapSelection("`", "`", "code"),
    link: () => wrapSelection("[", "](https://)", "link text"),
    inlineMath: () => wrapSelection("$", "$", "x^2"),
    displayMath: () => insertBlock("$$\n{{}}\n$$", "\\sum_{n=1}^\\infty \\frac{1}{n^2} = \\frac{\\pi^2}{6}"),
    heading: () => toggleLinePrefix(/^#{1,6} /, () => "## "),
    quote: () => toggleLinePrefix(/^> ?/, () => "> "),
    bullets: () => toggleLinePrefix(/^\s*[-*+] /, () => "- "),
    numbers: () => toggleLinePrefix(/^\s*\d+[.)] /, (i) => `${i + 1}. `),
  };

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const mod = e.metaKey || e.ctrlKey;
    const key = e.key.toLowerCase();

    if (mod && !e.altKey) {
      const shortcut = e.shiftKey
        ? { m: actions.displayMath }[key]
        : { b: actions.bold, i: actions.italic, k: actions.link, e: actions.code, m: actions.inlineMath }[key];
      if (shortcut) {
        e.preventDefault();
        shortcut();
      }
      return;
    }

    const ta = e.currentTarget;
    const { selectionStart: s, selectionEnd: end, value: v } = ta;

    if (e.key === "Tab" && !e.altKey) {
      e.preventDefault();
      if (e.shiftKey) {
        transformLines((lines) => lines.map((l) => l.replace(/^ {1,2}/, "")));
      } else if (v.slice(s, end).includes("\n")) {
        transformLines((lines) => lines.map((l) => "  " + l));
      } else {
        replaceRange(s, end, "  ");
      }
      return;
    }

    if (e.key === "Enter" && !e.shiftKey && !e.altKey && !e.nativeEvent.isComposing && s === end) {
      const lineStart = v.lastIndexOf("\n", s - 1) + 1;
      const lineEndIdx = v.indexOf("\n", s);
      const line = v.slice(lineStart, lineEndIdx < 0 ? v.length : lineEndIdx);
      const m = /^(\s*)([-*+]|(\d+)([.)]))(\s+)(\[[ xX]\]\s+)?/.exec(line);
      if (!m || s - lineStart < m[0].length) return;
      e.preventDefault();
      if (!line.slice(m[0].length).trim()) {
        replaceRange(lineStart, lineStart + line.length, "");
      } else {
        const marker = m[3] ? `${Number(m[3]) + 1}${m[4]}` : m[2];
        replaceRange(s, s, `\n${m[1]}${marker}${m[5]}${m[6] ? "[ ] " : ""}`);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Images.

  async function handleImageUpload(file: File) {
    if (file.size > 16 * 1024 * 1024) {
      alert("Image must be under 16 MB");
      return;
    }
    setUploading(true);
    try {
      const { url, filename } = await uploadFile(file, "images");
      insertBlock(`![${filename}](${url})`, "");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      e.preventDefault();
      handleImageUpload(file);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    for (const item of e.clipboardData.items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) handleImageUpload(file);
        return;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Split divider.

  function resizeTo(clientY: number) {
    const rect = splitRef.current?.getBoundingClientRect();
    if (rect) setRatio(clamp((clientY - rect.top) / rect.height, 0.15, 0.85));
  }

  function handleDividerKey(e: React.KeyboardEvent) {
    const step = e.shiftKey ? 0.1 : 0.03;
    if (e.key === "ArrowUp") setRatio((r) => clamp(r - step, 0.15, 0.85));
    else if (e.key === "ArrowDown") setRatio((r) => clamp(r + step, 0.15, 0.85));
    else return;
    e.preventDefault();
  }

  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  const editing = mode !== "preview";

  return (
    <div
      ref={rootRef}
      className={
        fullscreen
          ? "fixed inset-0 z-50 flex flex-col bg-background"
          : "flex flex-col overflow-hidden rounded-lg border border-border bg-card"
      }
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-card px-2 py-1.5">
        <div className="mr-1 flex rounded-md border border-border p-0.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`rounded px-2.5 py-1 text-xs transition-colors ${
                mode === m.id
                  ? "bg-accent font-medium text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <ToolbarDivider />
        <ToolButton title="Bold (⌘B)" disabled={!editing} onClick={actions.bold}>
          <span className="font-bold">B</span>
        </ToolButton>
        <ToolButton title="Italic (⌘I)" disabled={!editing} onClick={actions.italic}>
          <span className="italic">I</span>
        </ToolButton>
        <ToolButton title="Heading" disabled={!editing} onClick={actions.heading}>
          H
        </ToolButton>
        <ToolButton title="Quote" disabled={!editing} onClick={actions.quote}>
          &ldquo;&rdquo;
        </ToolButton>
        <ToolButton title="Bulleted list" disabled={!editing} onClick={actions.bullets}>
          &bull;&nbsp;List
        </ToolButton>
        <ToolButton title="Numbered list" disabled={!editing} onClick={actions.numbers}>
          1.&nbsp;List
        </ToolButton>
        <ToolButton title="Inline code (⌘E)" disabled={!editing} onClick={actions.code}>
          <span className="font-mono">{"</>"}</span>
        </ToolButton>
        <ToolButton title="Link (⌘K)" disabled={!editing} onClick={actions.link}>
          Link
        </ToolButton>

        <ToolbarDivider />
        <ToolButton title="Inline math (⌘M)" disabled={!editing} onClick={actions.inlineMath}>
          <span className="font-serif italic">$x$</span>
        </ToolButton>
        <ToolButton title="Display math (⌘⇧M)" disabled={!editing} onClick={actions.displayMath}>
          <span className="font-serif">$$ Σ $$</span>
        </ToolButton>
        <select
          value=""
          disabled={!editing}
          onChange={(e) => insertSnippet(e.target.value)}
          className="rounded border border-border bg-card px-1.5 py-1 text-xs text-muted outline-none hover:text-foreground disabled:opacity-40"
          title="Insert a LaTeX environment or block"
        >
          <option value="" disabled>
            Insert…
          </option>
          {SNIPPETS.map((group) => (
            <optgroup key={group.group} label={group.group}>
              {group.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <ToolButton
          title="Insert image (or paste / drag one into the editor)"
          disabled={!editing || uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? "Uploading…" : "Image"}
        </ToolButton>
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

        <div className="ml-auto flex items-center gap-1">
          {mode === "split" && (
            <ToolButton
              title="Scroll the preview along with the editor"
              active={syncScroll}
              onClick={() => setSyncScroll((v) => !v)}
            >
              Sync scroll
            </ToolButton>
          )}
          <ToolButton
            title="Markdown & LaTeX reference"
            active={showHelp}
            onClick={() => setShowHelp((v) => !v)}
          >
            ?
          </ToolButton>
          <ToolButton
            title={fullscreen ? "Exit full screen (Esc)" : "Full screen"}
            onClick={fullscreen ? exitFullscreen : enterFullscreen}
          >
            {fullscreen ? <CollapseIcon /> : <ExpandIcon />}
          </ToolButton>
        </div>
      </div>

      {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}

      <div
        ref={splitRef}
        className={`flex min-h-0 flex-col ${
          fullscreen ? "h-auto! flex-1" : "h-[70vh] min-h-[420px] resize-y overflow-hidden"
        } ${dragging ? "cursor-row-resize select-none" : ""}`}
      >
        {mode !== "write" && (
          <div
            ref={previewRef}
            className="min-h-0 overflow-y-auto bg-card"
            style={mode === "split" ? { height: `${ratio * 100}%` } : { flex: 1 }}
          >
            <div className={`mx-auto px-6 py-5 ${fullscreen ? "max-w-3xl py-8" : ""}`}>
              {preview}
            </div>
          </div>
        )}

        {mode === "split" && (
          <div
            role="separator"
            aria-orientation="horizontal"
            aria-valuenow={Math.round(ratio * 100)}
            aria-label="Resize preview and editor"
            tabIndex={0}
            onPointerDown={(e) => {
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              setDragging(true);
            }}
            onPointerMove={(e) => dragging && resizeTo(e.clientY)}
            onPointerUp={(e) => {
              e.currentTarget.releasePointerCapture(e.pointerId);
              setDragging(false);
            }}
            onDoubleClick={() => setRatio(DEFAULT_RATIO)}
            onKeyDown={handleDividerKey}
            title="Drag to resize · double-click to reset"
            className="group relative flex h-2 shrink-0 cursor-row-resize items-center justify-center border-y border-border bg-background outline-none focus-visible:bg-border"
          >
            <span className="h-0.5 w-10 rounded-full bg-border transition-colors group-hover:bg-muted" />
          </div>
        )}

        {mode !== "preview" && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={syncPreview}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onPaste={handlePaste}
            spellCheck
            placeholder={
              "Write Markdown with LaTeX…\n\n" +
              "Inline math: $e^{i\\pi}+1=0$\n" +
              "\\begin{equation}\n  \\int_0^1 x^2\\,dx = \\tfrac13 \\label{eq:int}\n\\end{equation}\n" +
              "See \\eqref{eq:int}. Paste or drag images here."
            }
            style={
              fullscreen
                ? { paddingInline: "max(1.5rem, calc((100% - 52rem) / 2))" }
                : undefined
            }
            className="min-h-0 w-full flex-1 resize-none bg-background px-4 py-4 font-mono text-[13px] leading-6 outline-none placeholder:text-muted/70"
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border bg-card px-3 py-1 text-[11px] text-muted">
        <span>
          {words} {words === 1 ? "word" : "words"} · {value.length} characters
        </span>
        <span>{fullscreen ? "Esc to exit full screen" : "Markdown + LaTeX (KaTeX)"}</span>
      </div>
    </div>
  );
}

function ToolButton({
  title,
  onClick,
  disabled,
  active,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-xs transition-colors disabled:pointer-events-none disabled:opacity-40 ${
        active
          ? "bg-border text-foreground"
          : "text-muted hover:bg-background hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 h-4 w-px bg-border" aria-hidden />;
}

function ExpandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
    </svg>
  );
}

function CollapseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M6 2v4H2M14 6h-4V2M10 14v-4h4M2 10h4v4" />
    </svg>
  );
}

const HELP_ROWS: [string, string][] = [
  ["Inline math", "$x^2$   or   \\(x^2\\)"],
  ["Display math", "$$ ... $$   or   \\[ ... \\]"],
  ["Numbered equation", "\\begin{equation} ... \\label{eq:key} \\end{equation}"],
  ["Multi-line", "align, gather, alignat, multline, split (starred = unnumbered)"],
  ["Skip a number", "\\nonumber or \\notag on that line; custom: \\tag{*}"],
  ["References", "\\eqref{eq:key} → (1),   \\ref{thm:key} → 1"],
  ["Macros", "\\newcommand{\\vect}[1]{\\mathbf{#1}}   \\DeclareMathOperator{\\tr}{tr}"],
  ["Theorems", "\\begin{theorem}[Name] \\label{thm:key} ... \\end{theorem}"],
  ["", "lemma, proposition, corollary, definition, example, remark, proof"],
  ["Shortcuts", "⌘B bold · ⌘I italic · ⌘K link · ⌘E code · ⌘M math · ⌘⇧M display · Tab indent"],
];

function HelpPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="relative border-b border-border bg-card px-4 py-3 text-xs">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-2 text-muted hover:text-foreground"
        aria-label="Close reference"
      >
        &times;
      </button>
      <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-[max-content_1fr]">
        {HELP_ROWS.map(([term, detail], i) => (
          <div key={i} className="contents">
            <dt className="font-medium text-foreground">{term}</dt>
            <dd className="font-mono text-muted">{detail}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
