"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, User } from "lucide-react";

interface TopBarProps {
  showSearch?: boolean;
  showNewPage?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export default function TopBar({
  showSearch = false,
  showNewPage = true,
  searchValue,
  onSearchChange,
}: TopBarProps) {
  const router = useRouter();
  const [localSearch, setLocalSearch] = useState("");

  const search = searchValue !== undefined ? searchValue : localSearch;
  const setSearch = onSearchChange || setLocalSearch;

  return (
    <header className="h-12 border-b border-border bg-ink-2 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <h2 className="text-sm font-semibold text-text">Pages</h2>

        {showSearch && (
          <div className="relative max-w-[280px] flex-1">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pages..."
              className="w-full h-8 pl-8 pr-3 bg-ink-3 border border-border rounded-input text-xs text-text placeholder:text-text-faint focus:border-indigo/50 transition-colors"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {showNewPage && (
          <button
            onClick={() => router.push("/generate")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo hover:bg-indigo/90 text-white text-sm font-medium rounded-input transition-colors"
          >
            <Plus size={14} />
            New page
          </button>
        )}
        <button
          onClick={() => router.push("/account")}
          className="w-8 h-8 bg-ink-3 border border-border rounded-full flex items-center justify-center text-text-faint hover:text-text transition-colors"
        >
          <User size={14} />
        </button>
      </div>
    </header>
  );
}
