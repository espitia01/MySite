export function PageHeader({
  breadcrumb,
  title,
  description,
  children,
}: {
  breadcrumb?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="pb-10 pt-12 sm:pt-16">
      {breadcrumb && <div className="mb-4 text-sm text-muted">{breadcrumb}</div>}
      <h1 className="font-serif text-[2.25rem] font-semibold leading-tight tracking-tight sm:text-[2.625rem]">
        {title}
      </h1>
      {description && (
        <p className="mt-3 max-w-2xl text-[1.0625rem] leading-relaxed text-muted">
          {description}
        </p>
      )}
      {children}
    </header>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-y border-border py-16 text-center text-sm text-muted">{children}</p>
  );
}
