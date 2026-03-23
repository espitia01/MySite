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
      className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
    >
      Admin
    </Link>
  );
}
