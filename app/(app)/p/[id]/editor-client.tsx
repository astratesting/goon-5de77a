"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Send, RefreshCw } from "lucide-react";
import TopBar from "@/components/TopBar";
import PreviewFrame from "@/components/PreviewFrame";
import ScoreBadge from "@/components/ScoreBadge";
import QAReportPanel from "@/components/QAReportPanel";
import PublishDialog from "@/components/PublishDialog";
import StatusPill from "@/components/StatusPill";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { showToast } from "@/components/ui/Toast";
import { sectionLabel, type SectionType } from "@/lib/pages/sections";

interface SectionData {
  id: string;
  type: string;
  content: Record<string, string>;
}

interface QACheck {
  name: string;
  status: "pass" | "warn" | "fail";
  value: string;
  detail: string;
  viewport?: string;
}

interface QAReportData {
  score: number;
  checks: QACheck[];
  ranAt: string;
}

interface PageData {
  id: string;
  title: string;
  prompt: string;
  status: string;
  html: string;
  sectionsJson: SectionData[];
  qaScore: number | null;
  qaReportJson: QAReportData | null;
  subdomain: string | null;
}

export default function EditorClient({ page: initialPage }: { page: PageData }) {
  const [page, setPage] = useState(initialPage);
  const [deviceWidth, setDeviceWidth] = useState("375");
  const [publishOpen, setPublishOpen] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [title, setTitle] = useState(page.title);
  const [savingTitle, setSavingTitle] = useState(false);

  const handleTitleSave = useCallback(async () => {
    if (title === page.title) return;
    setSavingTitle(true);
    try {
      await fetch(`/api/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
    } catch {
      showToast({ type: "error", message: "Failed to save title" });
    } finally {
      setSavingTitle(false);
    }
  }, [title, page.id, page.title]);

  const handleRegenerate = useCallback(
    async (sectionId: string) => {
      if (!instruction.trim()) return;
      setRegeneratingId(sectionId);
      try {
        const res = await fetch(
          `/api/pages/${page.id}/sections/${sectionId}/regenerate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ instruction: instruction.trim() }),
          }
        );
        if (!res.ok) {
          showToast({ type: "error", message: "Regeneration failed" });
          return;
        }
        const result = await res.json();
        setPage((prev) => ({
          ...prev,
          html: result.html,
          sectionsJson: result.sections,
          qaScore: result.qaReport.score,
          qaReportJson: result.qaReport,
        }));
        setInstruction("");
        showToast({ type: "success", message: "Section updated" });
      } catch {
        showToast({ type: "error", message: "Something went wrong" });
      } finally {
        setRegeneratingId(null);
      }
    },
    [page.id, instruction]
  );

  const checks: QACheck[] = page.qaReportJson?.checks || [];

  return (
    <div className="flex flex-col h-full">
      <TopBar
        rightSlot={
          <div className="flex items-center gap-3">
            {page.qaScore !== null && (
              <ScoreBadge score={page.qaScore} size="sm" />
            )}
            <StatusPill status={page.status} />
            <Button
              variant="primary"
              size="sm"
              onClick={() => setPublishOpen(true)}
            >
              Publish
            </Button>
          </div>
        }
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Sections */}
        <div className="w-50 border-r border-border bg-ink-2 flex flex-col shrink-0">
          <div className="p-3 border-b border-border">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm text-text-dim hover:text-text transition-colors duration-120"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </Link>
          </div>

          <div className="p-3 border-b border-border">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              className="w-full bg-transparent font-mono text-sm text-text outline-none"
              placeholder="Untitled page"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <p className="px-2 py-1 text-xs font-medium text-text-faint uppercase tracking-wider">
              Sections
            </p>
            {page.sectionsJson.map((section) => (
              <div key={section.id} className="group">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-input hover:bg-ink-3 transition-colors duration-120">
                  <span className="text-sm text-text-dim flex-1 truncate">
                    {sectionLabel(section.type as SectionType)}
                  </span>
                  <button
                    onClick={() => setRegeneratingId(regeneratingId === section.id ? null : section.id)}
                    className="opacity-0 group-hover:opacity-100 text-text-faint hover:text-text transition-all duration-120"
                  >
                    <RefreshCw size={12} />
                  </button>
                </div>

                {/* Inline regeneration form */}
                {regeneratingId === section.id && (
                  <div className="px-2 py-2 space-y-2">
                    <Input
                      value={instruction}
                      onChange={(e) => setInstruction(e.target.value)}
                      placeholder="What should change?"
                      className="text-xs"
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleRegenerate(section.id)}
                        loading={regeneratingId === section.id}
                        disabled={!instruction.trim()}
                      >
                        <Send size={12} />
                        Regenerate
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setRegeneratingId(null);
                          setInstruction("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Prompt */}
          <div className="p-3 border-t border-border">
            <p className="text-xs font-medium text-text-faint mb-1">Prompt</p>
            <p className="text-xs text-text-dim line-clamp-3">{page.prompt}</p>
          </div>
        </div>

        {/* Center: Preview */}
        <div className="flex-1 p-4 overflow-auto">
          <PreviewFrame
            html={page.html}
            deviceWidth={deviceWidth}
            onDeviceChange={setDeviceWidth}
            className="h-full"
          />
        </div>

        {/* Right: QA Panel */}
        <div className="w-72 border-l border-border bg-ink-2 p-3 overflow-y-auto shrink-0">
          {page.qaScore !== null ? (
            <QAReportPanel score={page.qaScore} checks={checks} />
          ) : (
            <div className="text-sm text-text-faint text-center py-8">
              QA report will appear after generation.
            </div>
          )}
        </div>
      </div>

      <PublishDialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        pageId={page.id}
        currentSlug={page.subdomain}
        pageTitle={page.title}
      />
    </div>
  );
}
