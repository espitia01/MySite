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

  const options = [
    { id: "all", label: "All" },
    ...CATEGORIES.map((cat) => ({ id: cat, label: CATEGORY_LABELS[cat] })),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = active === option.id;
        return (
          <button
            key={option.id}
            onClick={() => handleFilter(option.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
              isActive
                ? "bg-accent text-white"
                : "border border-border bg-card text-muted hover:border-muted hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
