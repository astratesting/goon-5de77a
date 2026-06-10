"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layout, FolderOpen, Settings, ChevronDown } from "lucide-react";
import { useState } from "react";

interface LeftRailProps {
  children?: React.ReactNode;
}

export default function LeftRail({ children }: LeftRailProps) {
  const pathname = usePathname();
  const [projectsOpen, setProjectsOpen] = useState(true);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Layout },
    { href: "/generate", label: "New page", icon: FolderOpen },
  ];

  return (
    <aside className="w-60 border-r border-border bg-ink-2 flex flex-col shrink-0 h-full">
      <div className="p-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-lg font-semibold text-text tracking-tight">goon</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <button
          onClick={() => setProjectsOpen(!projectsOpen)}
          className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium text-text-faint uppercase tracking-wider hover:text-text-dim transition-colors duration-120"
        >
          <span>Projects</span>
          <ChevronDown
            size={12}
            className={`transition-transform duration-120 ${projectsOpen ? "" : "-rotate-90"}`}
          />
        </button>

        {projectsOpen && (
          <div className="mt-1 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-2 py-2 rounded-input text-sm transition-all duration-120 ${
                    isActive
                      ? "bg-ink-3 text-text"
                      : "text-text-dim hover:text-text hover:bg-ink-3"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {children}
      </nav>

      <div className="p-3 border-t border-border">
        <Link
          href="/account"
          className={`flex items-center gap-2 px-2 py-2 rounded-input text-sm transition-all duration-120 ${
            pathname === "/account"
              ? "bg-ink-3 text-text"
              : "text-text-dim hover:text-text hover:bg-ink-3"
          }`}
        >
          <Settings size={16} />
          <span>Account</span>
        </Link>
      </div>
    </aside>
  );
}
