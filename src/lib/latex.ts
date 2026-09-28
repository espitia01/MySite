// Preprocesses Markdown so LaTeX-style syntax renders through remark-math + KaTeX:
// display environments (equation, align, ...), \[ \] and \( \) delimiters,
// automatic equation numbering with \label / \ref / \eqref, preamble macros
// (\newcommand, \DeclareMathOperator, \def) and theorem-like environments.

export const THEOREM_KINDS = [
  "theorem",
  "lemma",
  "proposition",
  "corollary",
  "conjecture",
  "claim",
  "definition",
  "example",
  "exercise",
  "problem",
  "remark",
  "note",
  "proof",
  "solution",
] as const;

export type TheoremKind = (typeof THEOREM_KINDS)[number];

export type Block =
  | { kind: "markdown"; text: string }
  | {
      kind: "env";
      env: TheoremKind;
      title?: string;
      number?: number;
      children: Block[];
    };

export interface PreparedMarkdown {
  blocks: Block[];
  macros: Record<string, string>;
}

interface State {
  eq: number;
  thm: number;
  refs: Map<string, string>;
}

const UNNUMBERED_THEOREMS = new Set<TheoremKind>(["proof", "solution"]);

// KaTeX lacks some amsmath environments, so each maps to its closest starred
// equivalent; numbering is added explicitly with \tag.
const DISPLAY_ENV_TARGET: Record<string, string> = {
  equation: "equation*",
  align: "align*",
  gather: "gather*",
  alignat: "alignat*",
  multline: "gather*",
  flalign: "align*",
};
const ROW_NUMBERED_ENVS = new Set(["align", "gather", "alignat", "flalign"]);

const LABEL_RE = /\\label\s*\{([^}]*)\}/g;
const NONUMBER_RE = /\\(?:nonumber|notag)(?![A-Za-z])/g;

export function prepareMarkdown(source: string): PreparedMarkdown {
  try {
    const { text: masked, restore } = maskCode(source);
    const { text: withoutDefs, macros } = extractMacros(masked);
    const state: State = { eq: 0, thm: 0, refs: new Map() };
    const withMath = convertDisplayMath(withoutDefs, state);
    const blocks = parseBlocks(withMath, state);
    return { blocks: finalize(blocks, state, restore), macros };
  } catch {
    return { blocks: [{ kind: "markdown", text: source }], macros: {} };
  }
}

// ---------------------------------------------------------------------------
// Code masking: nothing inside fenced or inline code is touched.

function maskCode(src: string) {
  const stash: string[] = [];
  const put = (s: string) => `\u0000${stash.push(s) - 1}\u0000`;

  const lines = src.split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const open = /^ {0,3}(`{3,}|~{3,})/.exec(lines[i]);
    if (!open) {
      out.push(lines[i]);
      continue;
    }
    const fence = open[1];
    const closeRe = new RegExp(`^ {0,3}${fence[0]}{${fence.length},}\\s*$`);
    let j = i + 1;
    while (j < lines.length && !closeRe.test(lines[j])) j++;
    out.push(put(lines.slice(i, Math.min(j, lines.length - 1) + 1).join("\n")));
    i = j;
  }

  const text = out
    .join("\n")
    .replace(/(`+)(?!`)[\s\S]*?(?<!`)\1(?!`)/g, (m) => put(m));

  const restore = (s: string) =>
    s.replace(/\u0000(\d+)\u0000/g, (_, n: string) => stash[Number(n)]);

  return { text, restore };
}

// ---------------------------------------------------------------------------
// Low-level scanning helpers.

function matchBrace(s: string, open: number, openCh = "{", closeCh = "}") {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    const c = s[i];
    if (c === "\\") {
      i++;
    } else if (c === openCh) {
      depth++;
    } else if (c === closeCh) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function skipSpaces(s: string, i: number) {
  while (i < s.length && /\s/.test(s[i])) i++;
  return i;
}

function readGroup(s: string, i: number) {
  i = skipSpaces(s, i);
  if (s[i] !== "{") return null;
  const close = matchBrace(s, i);
  if (close < 0) return null;
  return { content: s.slice(i + 1, close), end: close + 1 };
}

function readBracket(s: string, i: number) {
  while (s[i] === " " || s[i] === "\t") i++;
  if (s[i] !== "[") return null;
  const close = matchBrace(s, i, "[", "]");
  if (close < 0) return null;
  return { content: s.slice(i + 1, close), end: close + 1 };
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findEnvEnd(s: string, from: number, name: string) {
  const re = new RegExp(`\\\\(begin|end)\\{${escapeRe(name)}\\}`, "g");
  re.lastIndex = from;
  let depth = 1;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    depth += m[1] === "begin" ? 1 : -1;
    if (depth === 0) return { start: m.index, end: m.index + m[0].length };
  }
  return null;
}

function isEscaped(s: string, i: number) {
  let n = 0;
  while (i - 1 - n >= 0 && s[i - 1 - n] === "\\") n++;
  return n % 2 === 1;
}

function findUnescaped(s: string, token: string, from: number) {
  let i = s.indexOf(token, from);
  while (i >= 0 && isEscaped(s, i)) i = s.indexOf(token, i + 1);
  return i;
}

function findInlineDollarClose(s: string, from: number) {
  for (let i = from; i < s.length; i++) {
    const c = s[i];
    if (c === "\\") i++;
    else if (c === "$") return i;
    else if (c === "\n" && /^\n[ \t>]*\n/.test(s.slice(i, i + 64))) return -1;
  }
  return -1;
}

// ---------------------------------------------------------------------------
// Macros: \newcommand, \renewcommand, \providecommand, \DeclareMathOperator, \def.

function readCommandName(s: string, i: number) {
  i = skipSpaces(s, i);
  if (s[i] === "{") {
    const close = matchBrace(s, i);
    if (close < 0) return null;
    const name = s.slice(i + 1, close).trim();
    return /^\\(?:[A-Za-z]+|.)$/.test(name) ? { name, end: close + 1 } : null;
  }
  const m = /^\\(?:[A-Za-z]+|.)/.exec(s.slice(i));
  return m ? { name: m[0], end: i + m[0].length } : null;
}

function parseDefinition(s: string, kind: string, star: string, i: number) {
  const cmd = readCommandName(s, i);
  if (!cmd) return null;
  i = cmd.end;

  if (kind === "def") {
    const brace = s.indexOf("{", i);
    if (brace < 0 || /[^#\d\s]/.test(s.slice(i, brace))) return null;
    const close = matchBrace(s, brace);
    if (close < 0) return null;
    return { name: cmd.name, body: s.slice(brace + 1, close), end: close + 1 };
  }

  if (kind === "DeclareMathOperator") {
    const group = readGroup(s, i);
    if (!group) return null;
    return {
      name: cmd.name,
      body: `\\operatorname${star}{${group.content}}`,
      end: group.end,
    };
  }

  // \newcommand{\name}[n][default]{body} — KaTeX infers the arity from #n,
  // and optional-argument defaults are not supported, so both are skipped.
  for (let k = 0; k < 2; k++) {
    const bracket = readBracket(s, skipSpaces(s, i));
    if (!bracket) break;
    i = bracket.end;
  }
  const group = readGroup(s, i);
  if (!group) return null;
  return { name: cmd.name, body: group.content, end: group.end };
}

function extractMacros(text: string) {
  const macros: Record<string, string> = {};
  const re =
    /\\(newcommand|renewcommand|providecommand|DeclareMathOperator)(\*?)|\\(def)(?=\s*\\)/g;
  let out = "";
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (isEscaped(text, m.index)) continue;
    const def = parseDefinition(
      text,
      m[1] ?? m[3],
      m[2] ?? "",
      m.index + m[0].length
    );
    if (!def) continue;
    macros[def.name] = def.body;
    out += text.slice(last, m.index);
    last = def.end;
    re.lastIndex = def.end;
  }
  return { text: out + text.slice(last), macros };
}

// ---------------------------------------------------------------------------
// Display math and equation numbering.

function convertDisplayMath(text: string, state: State) {
  let out = "";
  let i = 0;

  const emit = (raw: string, resumeAt: number) => {
    out = emitDisplay(out, raw, state);
    i = resumeAt;
    while (text[i] === " " || text[i] === "\t") i++;
  };

  while (i < text.length) {
    const c = text[i];

    if (c === "$") {
      if (text[i + 1] === "$") {
        const close = findUnescaped(text, "$$", i + 2);
        if (close >= 0) {
          emit(text.slice(i + 2, close), close + 2);
          continue;
        }
      } else {
        const close = findInlineDollarClose(text, i + 1);
        if (close >= 0) {
          out += text.slice(i, close + 1);
          i = close + 1;
          continue;
        }
      }
      out += c;
      i++;
      continue;
    }

    if (c === "\\") {
      const next = text[i + 1];
      if (next === "[") {
        const close = findUnescaped(text, "\\]", i + 2);
        if (close >= 0) {
          emit(text.slice(i + 2, close), close + 2);
          continue;
        }
      } else if (next === "(") {
        const close = findUnescaped(text, "\\)", i + 2);
        if (close >= 0) {
          out += `$${text.slice(i + 2, close).trim()}$`;
          i = close + 2;
          continue;
        }
      } else if (text.startsWith("\\begin{", i)) {
        const m = /^\\begin\{([a-z]+)(\*?)\}/.exec(text.slice(i, i + 32));
        if (m && m[1] in DISPLAY_ENV_TARGET) {
          const end = findEnvEnd(text, i + m[0].length, m[1] + m[2]);
          if (end) {
            emit(text.slice(i, end.end), end.end);
            continue;
          }
        }
      }
      out += text.slice(i, i + 2);
      i += 2;
      continue;
    }

    out += c;
    i++;
  }
  return out;
}

// Places the math on its own `$$` block while keeping it inside the current
// blockquote or list item.
function emitDisplay(out: string, raw: string, state: State) {
  const lineStart = out.lastIndexOf("\n") + 1;
  const current = out.slice(lineStart);
  const m = /^((?:[ \t]*>)*)([ \t]*)(?:([-*+]|\d+[.)])([ \t]+))?/.exec(current)!;
  const quote = m[1];
  const indent = m[2].length + (m[3] ? m[3].length + m[4].length : 0);
  const prefix = quote + " ".repeat(indent);
  const blank = prefix.trimEnd();

  const quoteDepth = (quote.match(/>/g) ?? []).length;
  const unquoted = quoteDepth
    ? raw.replace(new RegExp(`\\n[ \\t]*(?:>[ \\t]?){1,${quoteDepth}}`, "g"), "\n")
    : raw;

  const math = processMath(unquoted, state).trim();
  if (!math) return out;

  const head = /^[\s>]*$/.test(current)
    ? out.slice(0, lineStart)
    : out.trimEnd() + "\n";
  const body = math
    .split("\n")
    .map((line) => prefix + line.trim())
    .join("\n");
  return `${head}${blank}\n${prefix}$$\n${body}\n${prefix}$$\n${blank}\n${prefix}`;
}

function processMath(math: string, state: State) {
  const re = /\\begin\{(equation|align|gather|multline|alignat|flalign)(\*?)\}/g;
  let out = "";
  let last = 0;
  let found = false;
  let m: RegExpExecArray | null;
  while ((m = re.exec(math))) {
    const end = findEnvEnd(math, m.index + m[0].length, m[1] + m[2]);
    if (!end) break;
    found = true;
    out +=
      math.slice(last, m.index) +
      numberEnv(m[1], m[2] === "*", math.slice(m.index + m[0].length, end.start), state);
    last = end.end;
    re.lastIndex = end.end;
  }
  out += math.slice(last);

  if (!found) {
    LABEL_RE.lastIndex = 0;
    out = numberRow(out, LABEL_RE.test(out), state);
  }
  return out.replace(LABEL_RE, "").replace(NONUMBER_RE, "");
}

function numberEnv(name: string, starred: boolean, inner: string, state: State) {
  let args = "";
  let body = inner;
  if (name === "alignat") {
    const group = readGroup(inner, 0);
    if (group) {
      args = `{${group.content}}`;
      body = inner.slice(group.end);
    }
  }

  const { rows, seps } = ROW_NUMBERED_ENVS.has(name)
    ? splitRows(body)
    : { rows: [body], seps: [] as string[] };

  let joined = "";
  rows.forEach((row, k) => {
    joined += numberRow(row, !starred, state) + (seps[k] ?? "");
  });

  const target = DISPLAY_ENV_TARGET[name];
  return `\\begin{${target}}${args}${joined}\\end{${target}}`;
}

function splitRows(body: string) {
  const rows: string[] = [];
  const seps: string[] = [];
  let braces = 0;
  let envs = 0;
  let start = 0;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === "\\") {
      if (body[i + 1] === "\\" && braces === 0 && envs === 0) {
        let j = i + 2;
        const spacing = /^\[\s*-?[\d.]+\s*[a-z]{2}\s*\]/.exec(body.slice(j));
        if (spacing) j += spacing[0].length;
        rows.push(body.slice(start, i));
        seps.push(body.slice(i, j));
        start = j;
        i = j - 1;
        continue;
      }
      if (body.startsWith("\\begin{", i)) envs++;
      else if (body.startsWith("\\end{", i)) envs--;
      i++;
    } else if (c === "{") {
      braces++;
    } else if (c === "}") {
      braces--;
    }
  }
  rows.push(body.slice(start));
  return { rows, seps };
}

function readTag(row: string) {
  const m = /\\tag\*?\s*\{/.exec(row);
  if (!m) return null;
  const open = m.index + m[0].length - 1;
  const close = matchBrace(row, open);
  return close < 0 ? null : row.slice(open + 1, close).trim();
}

function numberRow(row: string, auto: boolean, state: State) {
  if (!row.trim()) return row;

  const labels: string[] = [];
  let r = row.replace(LABEL_RE, (_, key: string) => {
    labels.push(key.trim());
    return "";
  });
  NONUMBER_RE.lastIndex = 0;
  const suppressed = NONUMBER_RE.test(r);
  r = r.replace(NONUMBER_RE, "");

  let value = readTag(r);
  if (value === null && auto && !suppressed) {
    value = String(++state.eq);
    r = r.replace(/\s*$/, (ws) => ` \\tag{${value}}${ws}`);
  }
  if (value !== null) {
    for (const key of labels) state.refs.set(key, value);
  }
  return r;
}

// ---------------------------------------------------------------------------
// Theorem-like environments.

const THEOREM_RE_SOURCE = `^[ \\t]*\\\\begin\\{(${THEOREM_KINDS.join("|")})(\\*?)\\}`;

function dedent(text: string) {
  const lines = text.replace(/^[ \t]*\n/, "").split("\n");
  const indents = lines
    .filter((l) => l.trim())
    .map((l) => /^[ \t]*/.exec(l)![0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => (l.trim() ? l.slice(min) : "")).join("\n");
}

function parseBlocks(text: string, state: State): Block[] {
  const blocks: Block[] = [];
  const re = new RegExp(THEOREM_RE_SOURCE, "gm");
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const env = m[1] as TheoremKind;
    const starred = m[2] === "*";
    const end = findEnvEnd(text, m.index + m[0].length, env + m[2]);
    if (!end) continue;

    let bodyStart = m.index + m[0].length;
    let title: string | undefined;
    const bracket = readBracket(text, bodyStart);
    if (bracket) {
      title = bracket.content.trim();
      bodyStart = bracket.end;
    }
    const leadingLabel = /^[ \t]*\\label\s*\{([^}]*)\}/.exec(
      text.slice(bodyStart, end.start)
    );
    if (leadingLabel) bodyStart += leadingLabel[0].length;

    if (m.index > last) {
      blocks.push({ kind: "markdown", text: text.slice(last, m.index) });
    }

    const number =
      starred || UNNUMBERED_THEOREMS.has(env) ? undefined : ++state.thm;
    if (leadingLabel && number !== undefined) {
      state.refs.set(leadingLabel[1].trim(), String(number));
    }
    const children = parseBlocks(dedent(text.slice(bodyStart, end.start)), state);
    for (const child of children) {
      if (child.kind !== "markdown") continue;
      child.text = child.text.replace(LABEL_RE, (_, key: string) => {
        if (number !== undefined) state.refs.set(key.trim(), String(number));
        return "";
      });
    }

    blocks.push({ kind: "env", env, title, number, children });
    last = end.end;
    re.lastIndex = end.end;
  }
  if (last < text.length) {
    blocks.push({ kind: "markdown", text: text.slice(last) });
  }
  return blocks;
}

// ---------------------------------------------------------------------------
// References and code restoration.

function finalize(
  blocks: Block[],
  state: State,
  restore: (s: string) => string
): Block[] {
  const resolve = (s: string) =>
    restore(
      s
        .replace(/\\(eqref|ref)\s*\{([^}]*)\}/g, (_, cmd: string, key: string) => {
          const value = state.refs.get(key.trim()) ?? "??";
          return cmd === "eqref" ? `(${value})` : value;
        })
        .replace(LABEL_RE, "")
    );

  return blocks.map((block) =>
    block.kind === "markdown"
      ? { kind: "markdown", text: resolve(block.text) }
      : {
          ...block,
          title: block.title === undefined ? undefined : resolve(block.title),
          children: finalize(block.children, state, restore),
        }
  );
}
