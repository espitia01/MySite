import Link from "next/link";
import { CoffeeMugIcon } from "@/components/CoffeeMugIcon";
import { isAuthenticated } from "@/lib/auth";

export async function Header() {
  const admin = await isAuthenticated();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold tracking-tight sm:text-lg"
        >
          <CoffeeMugIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          Giovanny Espitia&apos;s Notes
        </Link>
        <nav className="flex items-center gap-3 text-sm sm:gap-6">
          <Link
            href="/notes"
            className="text-muted transition-colors hover:text-foreground"
          >
            Browse
          </Link>
          <Link
            href="/folders"
            className="text-muted transition-colors hover:text-foreground"
          >
            Folders
          </Link>
          <Link
            href="/about"
            className="text-muted transition-colors hover:text-foreground"
          >
            About
          </Link>
          {admin && (
            <Link
              href="/admin/dashboard"
              className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
            >
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
