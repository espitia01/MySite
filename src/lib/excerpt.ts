import { prepareMarkdown, type Block } from "@/lib/latex";

const NON_PROSE = /^(#|\$\$|```|~~~|\||>|!\[|<|-{3,}|\*{3,}|\\begin|[-*+]\s|\d+[.)]\s)/;

function markdownTexts(blocks: Block[]): string[] {
  return blocks.flatMap((b) => (b.kind === "markdown" ? [b.text] : markdownTexts(b.children)));
}

function unescapedDollars(s: string) {
  return (s.match(/(?<!\\)\$/g) ?? []).length;
}

/**
 * The first prose paragraph of a note, trimmed to `max` characters without
 * splitting inline math. Returned as Markdown along with the note's macros so
 * inline LaTeX still renders.
 */
export function noteExcerpt(source: string, max = 280) {
  const { blocks, macros } = prepareMarkdown(source);
  const paragraph =
    markdownTexts(blocks)
      .flatMap((t) => t.split(/\n\s*\n/))
      .map((p) => p.trim())
      .find((p) => p && !NON_PROSE.test(p)) ?? "";

  let text = paragraph
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length > max) {
    text = text.slice(0, text.lastIndexOf(" ", max) > 0 ? text.lastIndexOf(" ", max) : max);
    if (unescapedDollars(text) % 2 === 1) text = text.slice(0, text.lastIndexOf("$"));
    text = text.replace(/[\s,;:.\-–—]+$/, "") + "…";
  }

  return { text, macros };
}

export function plainExcerpt(source: string, max = 160) {
  const { text } = noteExcerpt(source, max);
  return text.replace(/[*_`$\\]/g, "").replace(/\s+/g, " ").trim();
}
