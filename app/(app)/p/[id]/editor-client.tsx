"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import PreviewFrame from "@/components/PreviewFrame";
import QAReportPanel from "@/components/QAReportPanel";
import PublishDialog from "@/components/PublishDialog";
import ScoreBadge from "@/components/ScoreBadge";
import StatusPill from "@/components/StatusPill";
import QATab from "@/app/(app)/dashboard/pages/[id]/qa-tab";
import {
  ArrowLeft,
  Pencil,
  RefreshCw,
  Wand2,
  X,
  BarChart3,
} from "lucide-react";
import type { QAReport } from "@/lib/qa/runner";

interface Section {
  id: string;
  type: string;
  title: string;
  content: string | Record<string, string>;
}

interface PageData {
  id: string;
  title: string;
  prompt: string;
  status: string;
  html: string | null;
  sectionsJson: Section[] | null;
  qaScore: number | null;
  qaReportJson: QAReport | null;
  subdomain: string | null;
  createdAt: string;
  updatedAt: string;
}

type RightTab = "qa" | "content";

export default function EditorClient({ page: initialPage }: { page: PageData }) {
  const router = useRouter();
  const [page, setPage] = useState<PageData>(initialPage);
  const [deviceWidth, setDeviceWidth] = useState("1280");
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [title, setTitle] = useState(page.title);
  const [rightTab, setRightTab] = useState<RightTab>("qa");

  const handleTitleBlur = useCallback(async () => {
    if (title === page.title) return;
    try {
      await fetch(`/api/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      setPage((p) => ({ ...p, title }));
    } catch {
      setTitle(page.title);
    }
  }, [title, page.title, page.id]);

  const handleRegenerateSection = useCallback(
    async (sectionId: string) => {
      if (!instruction.trim()) return;
      setRegeneratingSection(sectionId);
      try {
        const res = await fetch(
          `/api/pages/${page.id}/sections/${sectionId}/regenerate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ instruction }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          setPage((p) => ({
            ...p,
            sectionsJson: data.sections,
            html: data.html,
            qaReportJson: data.qaReport,
            qaScore: data.qaReport.score,
          }));
          setInstruction("");
        }
      } catch {
        // silent
      } finally {
        setRegeneratingSection(null);
      }
    },
    [instruction, page.id]
  );

  const sections = page.sectionsJson || [];
  const qaReport = page.qaReportJson;

  // Build enhanced QA result for the QA tab
  const enhancedReport = qaReport ? {
    overall: qaReport.score,
    band: qaReport.score >= 90 ? "good" as const : qaReport.score >= 70 ? "fair" as const : "poor" as const,
    categories: [
      { id: "mobile", score: qaReport.breakdown.mobileScore, issues: [] },
      { id: "layout", score: qaReport.breakdown.layoutScore, issues: [] },
    ],
    suggestions: [],
  } : null;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar with score + publish */}
      <div className="h-12 border-b border-border bg-ink-2 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-text-faint hover:text-text transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <ScoreBadge score={qaReport?.score ?? 0} size="sm" />
          <StatusPill status={page.status} />
          {page.subdomain && (
            <span className="text-xs font-mono text-text-faint">
              {page.subdomain}.goon.app
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPublishDialog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo hover:bg-indigo/90 text-white text-sm font-medium rounded-input transition-colors"
          >
            Publish
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-60 border-r border-border bg-ink-2 flex flex-col shrink-0 overflow-hidden">
          {/* Title */}
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Pencil size={12} className="text-text-faint shrink-0" />
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                className="flex-1 bg-transparent text-sm text-text font-medium border-none outline-none truncate"
              />
            </div>
          </div>

          {/* Sections */}
          <div className="flex-1 overflow-auto p-3 space-y-2">
            <p className="text-xs text-text-faint uppercase tracking-wider mb-2">
              Sections
            </p>
            {sections.length === 0 ? (
              <p className="text-xs text-text-faint">No sections</p>
            ) : (
              sections.map((section) => (
                <div
                  key={section.id}
                  className="p-2 bg-ink-3 border border-border rounded-card space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-text capitalize">
                        {section.type}
                      </p>
                      <p className="text-xs text-text-faint truncate">
                        {section.title}
                      </p>
                    </div>
                    {regeneratingSection === section.id ? (
                      <RefreshCw
                        size={12}
                        className="text-cyan animate-spin"
                      />
                    ) : (
                      <button
                        onClick={() => handleRegenerateSection(section.id)}
                        className="text-text-faint hover:text-cyan transition-colors"
                        title="Regenerate section"
                      >
                        <Wand2 size={12} />
                      </button>
                    )}
                  </div>
                  {/* Regenerate form */}
                  <div className="flex gap-1.5">
                    <input
                      value={regeneratingSection === section.id ? instruction : ""}
                      onChange={(e) => {
                        setInstruction(e.target.value);
                        setRegeneratingSection(section.id);
                      }}
                      onFocus={() => setRegeneratingSection(section.id)}
                      placeholder="Regeneration instructions..."
                      className="flex-1 h-7 px-2 bg-ink border border-border rounded text-xs text-text placeholder:text-text-faint focus:border-indigo/50 transition-colors"
                    />
                    <button
                      onClick={() => handleRegenerateSection(section.id)}
                      disabled={!instruction.trim() || regeneratingSection === section.id}
                      className="px-2 h-7 bg-cyan/20 hover:bg-cyan/30 text-cyan text-xs rounded transition-colors disabled:opacity-50"
                    >
                      Go
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Prompt */}
          <div className="p-3 border-t border-border">
            <p className="text-xs text-text-faint uppercase tracking-wider mb-1">
              Prompt
            </p>
            <p className="text-xs text-text-dim line-clamp-3">{page.prompt}</p>
          </div>
        </aside>

        {/* Center: preview */}
        <main className="flex-1 overflow-hidden">
          <PreviewFrame
            html={page.html || ""}
            deviceWidth={deviceWidth}
            onDeviceChange={setDeviceWidth}
          />
        </main>

        {/* Right panel with tabs */}
        <aside className="w-72 border-l border-border bg-ink-2 flex flex-col shrink-0 overflow-hidden">
          {/* Tab header */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setRightTab("qa")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                rightTab === "qa"
                  ? "text-cyan border-b-2 border-cyan"
                  : "text-text-faint hover:text-text-dim"
              }`}
            >
              <BarChart3 size={12} />
              QA
            </button>
            <button
              onClick={() => setRightTab("content")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                rightTab === "content"
                  ? "text-cyan border-b-2 border-cyan"
                  : "text-text-faint hover:text-text-dim"
              }`}
            >
              Content
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-auto">
            {rightTab === "qa" ? (
              <QATab
                pageId={page.id}
                score={page.qaScore}
                report={enhancedReport}
              />
            ) : (
              <div className="p-4 space-y-3">
                <p className="text-xs text-text-faint">
                  Edit sections in the left panel. Each section has a regenerate button
                  where you can provide custom instructions.
                </p>
                <div className="bg-ink border border-border rounded-card p-3">
                  <p className="text-xs font-medium text-text mb-1">Current version</p>
                  <p className="text-xs text-text-faint">v{initialPage.updatedAt ? "1" : "—"}</p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Publish dialog */}
      <PublishDialog
        pageId={page.id}
        open={showPublishDialog}
        onClose={() => setShowPublishDialog(false)}
        currentSlug={page.subdomain}
        pageTitle={page.title}
      />
    </div>
  );
}
