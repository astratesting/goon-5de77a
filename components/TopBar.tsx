"use client";

import { Search, Plus, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface TopBarProps {
  showSearch?: boolean;
  showNewPage?: boolean;
  rightSlot?: React.ReactNode;
}

export default function TopBar({ showSearch = false, showNewPage = false, rightSlot }: TopBarProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-14 border-b border-border bg-ink flex items-center px-4 gap-4 shrink-0">
      <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
        <span className="text-base font-medium text-text tracking-tight">goon</span>
      </Link>

      {showSearch && (
        <div className="flex-1 max-w-md mx-auto">
          <div className={`flex items-center gap-2 px-3 h-8 bg-ink-2 border rounded-input transition-all duration-120 ${searchFocused ? "border-indigo" : "border-border"}`}>
            <Search size={14} className="text-text-faint shrink-0" />
            <input
              type="text"
              placeholder="Search pages..."
              className="flex-1 bg-transparent text-sm text-text placeholder:text-text-faint outline-none"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 ml-auto">
        {showNewPage && (
          <Link
            href="/generate"
            className="inline-flex items-center gap-1.5 h-8 px-3 bg-indigo text-white text-sm font-medium rounded-input hover:brightness-110 transition-all duration-120"
          >
            <Plus size={14} />
            <span>New page</span>
          </Link>
        )}
        {rightSlot}
        <Link
          href="/account"
          className="flex items-center justify-center w-8 h-8 rounded-input bg-ink-2 border border-border text-text-dim hover:text-text hover:border-text-faint transition-all duration-120"
        >
          <User size={16} />
        </Link>
      </div>
    </header>
  );
}
