"use client";

import { useState, useMemo } from "react";
import TopBar from "@/components/TopBar";
import PageCard from "@/components/PageCard";
import EmptyState from "@/components/EmptyState";
import { FileText } from "lucide-react";
import Link from "next/link";

interface PageData {
  id: string;
  title: string;
  status: string;
  qaScore: number | null;
  updatedAt: string;
  subdomain: string | null;
}

interface DashboardClientProps {
  pages: PageData[];
}

type Filter = "all" | "draft" | "published";
type Sort = "updated" | "score" | "title";

export default function DashboardClient({ pages }: DashboardClientProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("updated");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = [...pages];

    // Filter
    if (filter === "draft") {
      result = result.filter((p) => p.status === "draft" || p.status === "generating");
    } else if (filter === "published") {
      result = result.filter((p) => p.status === "published");
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q));
    }

    // Sort
    if (sort === "updated") {
      result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (sort === "score") {
      result.sort((a, b) => (b.qaScore ?? 0) - (a.qaScore ?? 0));
    } else if (sort === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [pages, filter, sort, search]);

  return (
    <div className="flex flex-col h-full">
      <TopBar showSearch showNewPage />

      <div className="flex-1 overflow-auto p-6">
        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1">
            {(["all", "draft", "published"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm rounded-input transition-all duration-120 ${
                  filter === f
                    ? "bg-ink-3 text-text"
                    : "text-text-dim hover:text-text"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-8 px-2 bg-ink-2 border border-border rounded-input text-xs text-text-dim appearance-none cursor-pointer"
            >
              <option value="updated">Last edited</option>
              <option value="score">Score</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          pages.length === 0 ? (
            <EmptyState
              icon={<FileText size={48} strokeWidth={1} />}
              title="Your first page is one sentence away."
              action={
                <Link
                  href="/generate"
                  className="inline-flex items-center gap-1.5 h-10 px-4 bg-indigo text-white text-sm font-medium rounded-input hover:brightness-110 transition-all duration-120"
                >
                  Create a page
                </Link>
              }
            />
          ) : (
            <EmptyState
              title="No pages match your filters."
              description="Try adjusting your search or filter."
            />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((page) => (
              <PageCard
                key={page.id}
                id={page.id}
                title={page.title}
                status={page.status}
                score={page.qaScore}
                updatedAt={page.updatedAt}
                subdomain={page.subdomain}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
