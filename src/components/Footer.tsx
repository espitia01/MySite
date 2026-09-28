import Link from "next/link";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          &copy; {new Date().getFullYear()} {SITE.name}
          <span className="mx-2 text-subtle">&middot;</span>
          {SITE.affiliation}
        </p>
        <nav className="flex items-center gap-5">
          <a href={`mailto:${SITE.email}`} className="transition-colors hover:text-foreground">
            Email
          </a>
          <a
            href={SITE.links.scholar}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            Scholar
          </a>
          <a
            href={SITE.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
          <Link href="/admin" className="text-subtle/60 transition-colors hover:text-muted">
            Admin
          </Link>
        </nav>
      </div>
    </footer>
  );
}
