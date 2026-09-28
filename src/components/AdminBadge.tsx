"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function AdminBadge() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/auth")
      .then((res) => res.json())
      .then((data) => setIsAdmin(!!data.authenticated))
      .catch(() => setIsAdmin(false));
  }, []);

  if (!isAdmin) return null;

  return (
    <Link
      href="/admin/dashboard"
      className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-0.5 text-xs text-muted transition-colors hover:border-subtle hover:text-foreground"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-link" aria-hidden />
      Admin
    </Link>
  );
}
