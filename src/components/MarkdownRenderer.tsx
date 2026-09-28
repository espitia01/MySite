import ReactMarkdown, { type Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { prepareMarkdown, type Block, type TheoremKind } from "@/lib/latex";

type RenderOptions = Pick<Options, "remarkPlugins" | "rehypePlugins">;

const ENV_STYLE: Record<TheoremKind, "plain" | "definition" | "remark" | "proof"> = {
  theorem: "plain",
  lemma: "plain",
  proposition: "plain",
  corollary: "plain",
  conjecture: "plain",
  claim: "plain",
  definition: "definition",
  example: "definition",
  exercise: "definition",
  problem: "definition",
  remark: "remark",
  note: "remark",
  proof: "proof",
  solution: "proof",
};

export function MarkdownRenderer({
  source,
  className = "",
}: {
  source: string;
  className?: string;
}) {
  const { blocks, macros } = prepareMarkdown(source);
  const options: RenderOptions = {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [[rehypeKatex, { macros, strict: "ignore" }]],
  };

  return (
    <div className={`prose latex-doc ${className}`}>
      <Blocks blocks={blocks} options={options} />
    </div>
  );
}

/** Inline-only rendering (no paragraphs, links, or images) for excerpts inside links. */
export function MarkdownExcerpt({
  text,
  macros,
}: {
  text: string;
  macros: Record<string, string>;
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[[rehypeKatex, { macros: { ...macros }, strict: "ignore" }]]}
      disallowedElements={["p", "a", "img"]}
      unwrapDisallowed
    >
      {text}
    </ReactMarkdown>
  );
}

function Blocks({ blocks, options }: { blocks: Block[]; options: RenderOptions }) {
  return blocks.map((block, i) =>
    block.kind === "markdown" ? (
      <ReactMarkdown key={i} {...options}>
        {block.text}
      </ReactMarkdown>
    ) : (
      <EnvBlock key={i} block={block} options={options} />
    )
  );
}

function InlineMarkdown({ text, options }: { text: string; options: RenderOptions }) {
  return (
    <ReactMarkdown {...options} disallowedElements={["p"]} unwrapDisallowed>
      {text}
    </ReactMarkdown>
  );
}

function EnvBlock({
  block,
  options,
}: {
  block: Extract<Block, { kind: "env" }>;
  options: RenderOptions;
}) {
  const style = ENV_STYLE[block.env];
  const name = block.env[0].toUpperCase() + block.env.slice(1);

  return (
    <div className={`latex-env latex-env-${style}`}>
      <div className="latex-env-head">
        {style === "proof" ? (
          <em>
            {block.title ? <InlineMarkdown text={block.title} options={options} /> : name}.
          </em>
        ) : (
          <>
            <strong>
              {name}
              {block.number !== undefined && ` ${block.number}`}
            </strong>
            {block.title && (
              <>
                {" "}(<InlineMarkdown text={block.title} options={options} />)
              </>
            )}
            <strong>.</strong>
          </>
        )}
      </div>
      <div className="latex-env-body">
        <Blocks blocks={block.children} options={options} />
      </div>
      {style === "proof" && (
        <div className="latex-qed" aria-hidden>
          &#9633;
        </div>
      )}
    </div>
  );
}
