"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/types";

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") || "all";

  function handleFilter(category: string) {
    if (category === "all") {
      router.push("/notes");
    } else {
      router.push(`/notes?category=${category}`);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleFilter("all")}
        className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
          active === "all"
            ? "bg-accent text-white"
            : "bg-card border border-border text-muted hover:text-foreground"
        }`}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => handleFilter(cat)}
          className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
            active === cat
              ? "bg-accent text-white"
              : "bg-card border border-border text-muted hover:text-foreground"
          }`}
        >
          {CATEGORY_LABELS[cat]}
        </button>
      ))}
    </div>
  );
}
