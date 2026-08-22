const variants = {
  default: "bg-paper text-muted",
  outline: "border border-border text-muted",
  draft: "bg-amber-100 text-amber-950",
  accent: "bg-accent/10 text-accent",
} as const;

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
