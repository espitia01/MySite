import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-3xl flex-col justify-center px-5 sm:px-6">
      <p className="font-mono text-sm text-subtle">404</p>
      <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <div className="mt-8 flex gap-6 text-sm">
        <Link href="/" className="font-medium text-link hover:underline underline-offset-4">
          Go home
        </Link>
        <Link href="/notes" className="text-muted hover:text-foreground">
          Browse notes
        </Link>
      </div>
    </div>
  );
}
