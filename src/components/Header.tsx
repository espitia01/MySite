import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-base font-semibold tracking-tight sm:text-lg">
          Giovanny Espitia&apos;s Notes
        </Link>
        <nav className="flex items-center gap-4 text-sm sm:gap-6">
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
        </nav>
      </div>
    </header>
  );
}
