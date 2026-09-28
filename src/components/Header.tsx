import Link from "next/link";
import { AdminBadge } from "@/components/AdminBadge";
import { NavLink } from "@/components/NavLink";
import { SITE } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-6 px-5 sm:px-6">
        <Link
          href="/"
          className="font-serif text-[1.0625rem] font-semibold tracking-tight transition-colors hover:text-link"
        >
          {SITE.name}
        </Link>
        <nav className="flex items-center gap-5 text-sm sm:gap-7">
          <NavLink href="/notes">Notes</NavLink>
          <NavLink href="/folders">Folders</NavLink>
          <NavLink href="/about">About</NavLink>
          <AdminBadge />
        </nav>
      </div>
    </header>
  );
}
