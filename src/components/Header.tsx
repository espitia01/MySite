import Link from "next/link";
import { CoffeeMugIcon } from "@/components/CoffeeMugIcon";
import { AdminBadge } from "@/components/AdminBadge";

const links = [
  { href: "/notes", label: "Browse" },
  { href: "/folders", label: "Folders" },
  { href: "/about", label: "About" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-80"
        >
          <CoffeeMugIcon className="h-5 w-5 text-accent sm:h-6 sm:w-6" />
          <span className="font-serif text-lg font-semibold tracking-tight sm:text-[1.2rem]">
            Notes
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2.5 py-1.5 text-muted transition-colors hover:bg-paper/70 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <AdminBadge />
        </nav>
      </div>
    </header>
  );
}
