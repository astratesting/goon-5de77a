"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import PageCard from "@/components/PageCard";
import EmptyState from "@/components/EmptyState";
import { BarChart3, Smartphone, AlertTriangle, ArrowRight } from "lucide-react";

interface PageData {
  id: string;
  title: string;
  status: string;
  html: string | null;
  qaScore: number | null;
  qaReportJson: Record<string, unknown> | null;
  subdomain: string | null;
  createdAt: string;
  updatedAt: string;
}

type Filter = "all" | "draft" | "published";
type Sort = "updated" | "score" | "title";

export default function DashboardClient({ pages: initialPages }: { pages: PageData[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("updated");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = [...initialPages];

    // Filter
    if (filter === "draft") result = result.filter((p) => p.status === "draft");
    if (filter === "published") result = result.filter((p) => p.status === "published");

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.subdomain?.toLowerCase().includes(q)
      );
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
  }, [initialPages, filter, sort, search]);

  // QA summary
  const pagesWithScore = initialPages.filter((p) => p.qaScore !== null);
  const avgScore = pagesWithScore.length > 0
    ? Math.round(pagesWithScore.reduce((s, p) => s + (p.qaScore ?? 0), 0) / pagesWithScore.length)
    : 0;
  const mobileIssuesCount = initialPages.filter((p) => {
    const report = p.qaReportJson as Record<string, unknown> | null;
    const categories = (report?.categories as Array<{ id: string; issues: unknown[] }>) || [];
    return categories.some((c) => c.id === "mobile" && c.issues.length > 0);
  }).length;
  const unpublishedCount = initialPages.filter((p) => p.status !== "published").length;

  const scoreColor = avgScore >= 90 ? "text-teal" : avgScore >= 70 ? "text-cyan" : avgScore >= 50 ? "text-amber" : "text-red";

  return (
    <div className="h-full flex flex-col">
      <TopBar
        showSearch
        searchValue={search}
        onSearchChange={setSearch}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="flex gap-6 max-w-[1280px] mx-auto">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Filters */}
            <div className="flex items-center gap-3 mb-4">
              {(["all", "draft", "published"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-input text-xs font-medium capitalize transition-colors duration-120 ${
                    filter === f
                      ? "bg-indigo/20 text-indigo border border-indigo/30"
                      : "bg-ink-2 text-text-faint border border-border hover:text-text-dim"
                  }`}
                >
                  {f}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="bg-ink-2 border border-border rounded-input text-xs text-text-dim py-1.5 px-2 focus:outline-none"
                >
                  <option value="updated">Last updated</option>
                  <option value="score">Score</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>

            {/* Pages grid */}
            {filtered.length === 0 && initialPages.length === 0 ? (
              <EmptyState
                title="No pages yet"
                description="Describe your idea and Goon builds the first version"
                action={
                  <Link
                    href="/generate"
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-indigo text-white text-sm font-medium rounded-input hover:bg-indigo/90 transition-colors"
                  >
                    Create your first page
                  </Link>
                }
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                title="No pages match your filters"
                description="Try changing your search or filter"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((page) => (
                  <PageCard
                    key={page.id}
                    page={{
                      ...page,
                      qaReport: page.qaReportJson,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* QA Summary card (sidebar) */}
          <div className="w-64 shrink-0 hidden lg:block">
            <div className="bg-ink-2 border border-border rounded-card p-4 space-y-4 sticky top-6">
              <h3 className="text-sm font-medium text-text">QA Summary</h3>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-text-faint">Average Score</p>
                  <p className={`text-2xl font-mono font-semibold tabular-nums ${scoreColor}`}>
                    {avgScore}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <Smartphone size={14} className="text-amber" />
                  <span className="text-text-dim">
                    {mobileIssuesCount} page{mobileIssuesCount !== 1 ? "s" : ""} with mobile issues
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <AlertTriangle size={14} className="text-text-faint" />
                  <span className="text-text-dim">
                    {unpublishedCount} unpublished
                  </span>
                </div>
              </div>

              <Link
                href="/dashboard/qa"
                className="flex items-center gap-1.5 text-xs text-cyan hover:text-indigo transition-colors"
              >
                <BarChart3 size={12} />
                View QA Report
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
