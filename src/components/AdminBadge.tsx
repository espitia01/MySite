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
      className="ml-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium tracking-wide text-white transition-colors hover:bg-accent-hover"
    >
      Admin
    </Link>
  );
}
