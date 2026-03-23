import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-10">
        <Image
          src="/aboutMe/Espitia_Giovanny_Headshot.jpeg"
          alt="Giovanny Espitia"
          width={160}
          height={160}
          className="shrink-0 rounded-full object-cover"
          priority
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Giovanny Espitia
          </h1>
          <p className="mt-2 text-muted">
            Ph.D. Student in Physics &middot; The University of Texas at Austin
          </p>
          <p className="mt-1 text-sm text-muted">
            Theoretical &amp; Computational Condensed Matter Physics
          </p>
          <p className="mt-1 text-sm text-muted">
            Advisor: Mit H. Naik &middot; Dean&apos;s Strategic Fellow
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <a
              href="mailto:gespitia3@utexas.edu"
              className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" /><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" /></svg>
              Email
            </a>
            <a
              href="https://scholar.google.com/citations?user=gespitia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3.001z" /><path d="M3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z" /></svg>
              Google Scholar
            </a>
            <a
              href="https://github.com/espitia01"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/giovanny-espitia/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      <hr className="my-10 border-border" />

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Education</h2>
        <div className="mt-4 space-y-4">
          <div>
            <p className="font-medium">The University of Texas at Austin</p>
            <p className="text-sm text-muted">
              Ph.D. in Physics &middot; 2024 &ndash; Present
            </p>
            <p className="mt-1 text-sm text-muted">
              Dean&apos;s Strategic Fellow &mdash; sole recipient in the Department of Physics
            </p>
          </div>
          <div>
            <p className="font-medium">Georgia Institute of Technology</p>
            <p className="text-sm text-muted">
              B.S. in Physics, Highest Honors &middot; 2021 &ndash; 2024
            </p>
          </div>
        </div>
      </section>

      <hr className="my-10 border-border" />

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Selected Publications</h2>
        <ol className="mt-4 space-y-3 text-sm leading-relaxed">
          <li>
            <span className="font-medium">G. Espitia</span>, S.H. Lee, et al., &ldquo;Taco flat bands at a magic twist angle in bilayer transition metal dichalcogenides.&rdquo;
            <span className="text-muted"> Submitted to PRL, 2025</span>
          </li>
          <li>
            C. Shi, Y. Li, Y. Jiang, Y. Luo, <span className="font-medium">G. Espitia</span>, et al., &ldquo;Electron Ptychography Reveals Layer-Resolved Picometer-Scale Relaxation in Large-Angle Moiré.&rdquo;
            <span className="text-muted"> Science (in review), 2025</span>
          </li>
          <li>
            Z. Liu, <span className="font-medium">G. Espitia</span>, et al., &ldquo;Giant intervalley exciton absorption in a large twist-angle semiconductor bilayer.&rdquo;
            <span className="text-muted"> Nature (in review), 2025</span>
          </li>
          <li>
            Z. Liu, Q. Gao, Y. Li, <span className="font-medium">G. Espitia</span>, et al., &ldquo;Field-Tunable Valley Coupling in a Dodecagonal Semiconductor Quasicrystal.&rdquo;
            <span className="text-muted"> Nature Physics, 2025</span>
          </li>
          <li>
            <span className="font-medium">G. Espitia</span>, Y.T. Pang, J.C. Gumbart, &ldquo;Protein Structure Prediction Using Deep Reinforcement Learning in the 3D HP Model.&rdquo;
            <span className="text-muted"> arXiv:2412.20329, 2024</span>
          </li>
        </ol>
        <a
          href="/aboutMe/EspitiaGiovannyCV.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:text-muted"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" /></svg>
          Full CV (PDF) &rarr;
        </a>
      </section>

      <hr className="my-10 border-border" />

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Awards</h2>
        <ul className="mt-4 space-y-2 text-sm">
          <li>Antoniewicz Endowed Presidential Fellowship in Condensed Matter Physics <span className="text-muted">(2025)</span></li>
          <li>Dean&apos;s Strategic Fellowship, UT Austin Dept. of Physics <span className="text-muted">(2024&ndash;2025)</span></li>
          <li>Faculty Honors Award, Georgia Tech <span className="text-muted">(2021&ndash;2024)</span></li>
          <li>First-Year Research Scholarship, Kennesaw State University <span className="text-muted">(2020&ndash;2021)</span></li>
        </ul>
      </section>

      <hr className="my-10 border-border" />

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Software</h2>
        <div className="mt-4">
          <a
            href="https://twisterase.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4 hover:text-muted"
          >
            TwisterASE
          </a>
          <p className="mt-1 text-sm text-muted">
            A Python toolkit for generating twisted layered material structures (graphene, hBN, TMDs) and producing ready-to-run LAMMPS input files for molecular dynamics simulations.
          </p>
        </div>
      </section>

      <hr className="my-10 border-border" />

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Skills &amp; Languages</h2>
        <div className="mt-4 space-y-2 text-sm">
          <p>
            <span className="font-medium">Programming:</span>{" "}
            <span className="text-muted">Python, Julia, MATLAB, PyTorch, C++, CUDA, High-Performance Computing</span>
          </p>
          <p>
            <span className="font-medium">Languages:</span>{" "}
            <span className="text-muted">English (native), Spanish (fluent)</span>
          </p>
        </div>
      </section>
    </div>
  );
}
