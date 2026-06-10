"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  Settings,
  ChevronRight,
  FolderOpen,
  BarChart3,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
}

export default function LeftRail() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={16} />,
      active: pathname === "/dashboard",
    },
    {
      label: "QA Report",
      href: "/dashboard/qa",
      icon: <BarChart3 size={16} />,
      active: pathname.startsWith("/dashboard/qa"),
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: <Settings size={16} />,
      active: pathname.startsWith("/dashboard/settings"),
    },
  ];

  return (
    <aside className="w-50 h-full border-r border-border bg-ink-2 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 h-12 flex items-center border-b border-border">
        <Link href="/" className="text-base font-medium text-text tracking-tight">
          goon
        </Link>
      </div>

      {/* New page button */}
      <div className="p-3">
        <Link
          href="/generate"
          className="flex items-center gap-2 px-3 py-2 bg-indigo hover:bg-indigo/90 text-white text-sm font-medium rounded-input transition-colors duration-120"
        >
          <Plus size={14} />
          New page
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-input text-sm transition-colors duration-120 ${
              item.active
                ? "bg-ink-3 text-text font-medium"
                : "text-text-dim hover:text-text hover:bg-ink-3"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <Link
          href="/account"
          className="flex items-center gap-2.5 px-3 py-2 rounded-input text-sm text-text-dim hover:text-text hover:bg-ink-3 transition-colors duration-120"
        >
          <Settings size={16} />
          Account
        </Link>
      </div>
    </aside>
  );
}
