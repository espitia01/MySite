import type { Metadata } from "next";
import Image from "next/image";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Giovanny Espitia — Ph.D. student in physics at The University of Texas at Austin, working on theoretical and computational condensed matter physics.",
};

const EDUCATION = [
  {
    school: "The University of Texas at Austin",
    degree: "Ph.D. in Physics",
    years: "2024 – Present",
    note: "Dean\u2019s Strategic Fellow — sole recipient in the Department of Physics",
  },
  {
    school: "Georgia Institute of Technology",
    degree: "B.S. in Physics, Highest Honors",
    years: "2021 – 2024",
  },
];

const PUBLICATIONS: { authors: React.ReactNode; title: string; venue: string }[] = [
  {
    authors: (
      <>
        <Me />, S.H. Lee, et al.
      </>
    ),
    title: "Taco flat bands at a magic twist angle in bilayer transition metal dichalcogenides.",
    venue: "Submitted to PRL, 2025",
  },
  {
    authors: (
      <>
        C. Shi, Y. Li, Y. Jiang, Y. Luo, <Me />, et al.
      </>
    ),
    title:
      "Electron Ptychography Reveals Layer-Resolved Picometer-Scale Relaxation in Large-Angle Moiré.",
    venue: "Science (in review), 2025",
  },
  {
    authors: (
      <>
        Z. Liu, <Me />, et al.
      </>
    ),
    title: "Giant intervalley exciton absorption in a large twist-angle semiconductor bilayer.",
    venue: "Nature (in review), 2025",
  },
  {
    authors: (
      <>
        Z. Liu, Q. Gao, Y. Li, <Me />, et al.
      </>
    ),
    title: "Field-Tunable Valley Coupling in a Dodecagonal Semiconductor Quasicrystal.",
    venue: "Nature Physics, 2025",
  },
  {
    authors: (
      <>
        <Me />, Y.T. Pang, J.C. Gumbart
      </>
    ),
    title: "Protein Structure Prediction Using Deep Reinforcement Learning in the 3D HP Model.",
    venue: "arXiv:2412.20329, 2024",
  },
];

const AWARDS = [
  { name: "Antoniewicz Endowed Presidential Fellowship in Condensed Matter Physics", years: "2025" },
  { name: "Dean\u2019s Strategic Fellowship, UT Austin Dept. of Physics", years: "2024 – 2025" },
  { name: "Faculty Honors Award, Georgia Tech", years: "2021 – 2024" },
  { name: "First-Year Research Scholarship, Kennesaw State University", years: "2020 – 2021" },
];

const LINKS = [
  { label: "Email", href: `mailto:${SITE.email}` },
  { label: "Google Scholar", href: SITE.links.scholar },
  { label: "GitHub", href: SITE.links.github },
  { label: "LinkedIn", href: SITE.links.linkedin },
  { label: "CV (PDF)", href: SITE.links.cv },
];

function Me() {
  return <span className="font-semibold text-foreground">G. Espitia</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-border py-10 sm:grid-cols-[10rem_1fr] sm:gap-8">
      <h2 className="font-serif text-lg font-semibold tracking-tight">{title}</h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function Row({ children, aside }: { children: React.ReactNode; aside: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <div className="min-w-0">{children}</div>
      <span className="shrink-0 font-mono text-xs tabular-nums text-subtle">{aside}</span>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-6">
      <header className="flex flex-col gap-8 pb-12 pt-12 sm:flex-row sm:items-center sm:gap-10 sm:pt-16">
        <Image
          src="/aboutMe/Espitia_Giovanny_Headshot.jpeg"
          alt="Giovanny Espitia"
          width={136}
          height={136}
          className="h-28 w-28 shrink-0 rounded-full object-cover ring-1 ring-border sm:h-34 sm:w-34"
          priority
        />
        <div>
          <h1 className="font-serif text-[2.25rem] font-semibold leading-tight tracking-tight sm:text-[2.625rem]">
            Giovanny Espitia
          </h1>
          <p className="mt-2 text-[1.0625rem] text-foreground">
            Ph.D. Student in Physics, The University of Texas at Austin
          </p>
          <p className="mt-1 text-muted">
            Theoretical &amp; Computational Condensed Matter Physics{" "}
            <span className="whitespace-nowrap">&middot; Advisor: Mit H. Naik</span>
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {LINKS.map((link) => {
              const external = link.href.startsWith("http") || link.href.endsWith(".pdf");
              return (
                <li key={link.label}>
                  <a
                    href={link.href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="text-link underline decoration-link/30 underline-offset-4 transition-colors hover:decoration-link"
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </header>

      <Section title="Education">
        <div className="space-y-5">
          {EDUCATION.map((e) => (
            <Row key={e.school} aside={e.years}>
              <p className="font-medium">{e.school}</p>
              <p className="text-sm text-muted">{e.degree}</p>
              {e.note && <p className="mt-1 text-sm text-muted">{e.note}</p>}
            </Row>
          ))}
        </div>
      </Section>

      <Section title="Publications">
        <ol className="space-y-5">
          {PUBLICATIONS.map((p, i) => (
            <li key={p.title} className="grid grid-cols-[1.75rem_1fr] text-[0.9375rem] leading-relaxed">
              <span className="font-mono text-xs leading-[1.6rem] text-subtle">[{i + 1}]</span>
              <div>
                <p className="font-serif text-[1.0625rem] leading-snug text-foreground">{p.title}</p>
                <p className="mt-1 text-sm text-muted">{p.authors}</p>
                <p className="text-sm italic text-subtle">{p.venue}</p>
              </div>
            </li>
          ))}
        </ol>
        <a
          href={SITE.links.cv}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block text-sm text-muted transition-colors hover:text-foreground"
        >
          Full list in CV &rarr;
        </a>
      </Section>

      <Section title="Awards">
        <div className="space-y-3 text-[0.9375rem]">
          {AWARDS.map((a) => (
            <Row key={a.name} aside={a.years}>
              {a.name}
            </Row>
          ))}
        </div>
      </Section>

      <Section title="Software">
        <a
          href="https://twisterase.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-link underline decoration-link/30 underline-offset-4 hover:decoration-link"
        >
          TwisterASE
        </a>
        <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">
          A Python toolkit for generating twisted layered material structures (graphene, hBN,
          TMDs) and producing ready-to-run LAMMPS input files for molecular dynamics simulations.
        </p>
      </Section>

      <Section title="Skills">
        <dl className="space-y-2 text-[0.9375rem]">
          <div className="sm:flex sm:gap-3">
            <dt className="font-medium">Programming</dt>
            <dd className="text-muted">
              Python, Julia, MATLAB, PyTorch, C++, CUDA, High-Performance Computing
            </dd>
          </div>
          <div className="sm:flex sm:gap-3">
            <dt className="font-medium">Languages</dt>
            <dd className="text-muted">English (native), Spanish (fluent)</dd>
          </div>
        </dl>
      </Section>
    </div>
  );
}
