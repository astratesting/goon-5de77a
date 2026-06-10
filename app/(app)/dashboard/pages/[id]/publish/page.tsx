"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import Stepper from "@/components/publish/Stepper";
import SubdomainInput from "@/components/publish/SubdomainInput";
import PreviewPane from "@/components/publish/PreviewPane";
import DnsCard from "@/components/publish/DnsCard";
import SuccessCard from "@/components/publish/SuccessCard";
import Button from "@/components/ui/Button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { showToast } from "@/components/ui/Toast";
import { getExpectedDnsRecords } from "@/lib/publish/dns-records";

const STEPS = [
  { id: 1, label: "Subdomain" },
  { id: 2, label: "Preview" },
  { id: 3, label: "DNS" },
  { id: 4, label: "Publish" },
];

export default function PublishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [page, setPage] = useState<{ id: string; title: string; html: string | null; subdomain: string | null; status: string; qaScore: number | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [subdomain, setSubdomain] = useState("");
  const [subdomainStatus, setSubdomainStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState("");
  const [dnsVerified, setDnsVerified] = useState(false);

  const fetchPage = useCallback(async () => {
    try {
      const res = await fetch(`/api/pages/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPage(data);
        if (data.subdomain) {
          setSubdomain(data.subdomain);
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const canProceedFromStep = (s: number): boolean => {
    switch (s) {
      case 1: return subdomainStatus === "available" && subdomain.length >= 3;
      case 2: return true;
      case 3: return isCustomDomain ? dnsVerified : true;
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < 4 && canProceedFromStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleStepClick = (s: number) => {
    if (s <= step) setStep(s);
  };

  const handlePublish = async () => {
    if (!page) return;
    setPublishing(true);
    try {
      const res = await fetch("/api/publish/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: page.id,
          subdomain,
          isCustom: isCustomDomain,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPublishedUrl(data.publicUrl);
        setPublished(true);
        showToast({ type: "success", message: "Page published!" });
      } else {
        const err = await res.json();
        showToast({ type: "error", message: err.error || "Publish failed" });
      }
    } catch {
      showToast({ type: "error", message: "Publish failed" });
    } finally {
      setPublishing(false);
    }
  };

  const handleDnsVerify = async () => {
    const res = await fetch("/api/publish/dns-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host: subdomain }),
    });
    if (res.ok) {
      const data = await res.json();
      setDnsVerified(data.allOk);
      return data.results;
    }
    throw new Error("DNS check failed");
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <TopBar showSearch={false} showNewPage={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo/30 border-t-indigo rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="h-full flex flex-col">
        <TopBar showSearch={false} showNewPage={false} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-dim">Page not found</p>
        </div>
      </div>
    );
  }

  const isFreeDomain = !isCustomDomain;

  return (
    <div className="h-full flex flex-col">
      <TopBar showSearch={false} showNewPage={false} />

      <div className="flex-1 overflow-auto p-6 max-w-[800px] mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href={`/p/${id}`} className="text-text-faint hover:text-text transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-text">Publish: {page.title}</h1>
            <p className="text-xs text-text-faint">Make your page live</p>
          </div>
        </div>

        {/* Stepper */}
        <Stepper steps={STEPS} currentStep={step} onStepClick={handleStepClick} />

        {/* Step content */}
        <div className="bg-ink-2 border border-border rounded-card p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-medium text-text">Choose your subdomain</h2>
              <p className="text-sm text-text-dim">Pick a name for your page. This will be your public URL.</p>
              <SubdomainInput
                value={subdomain}
                onChange={setSubdomain}
                onStatusChange={(status) => setSubdomainStatus(status)}
              />
              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs text-text-faint">
                  <input
                    type="checkbox"
                    checked={isCustomDomain}
                    onChange={(e) => setIsCustomDomain(e.target.checked)}
                    className="rounded border-border"
                  />
                  Use a custom domain
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-medium text-text">Preview your page</h2>
              <p className="text-sm text-text-dim">This is exactly what visitors will see.</p>
              <PreviewPane pageId={id} score={page.qaScore} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-base font-medium text-text">
                {isFreeDomain ? "Subdomain confirmed" : "Set up DNS records"}
              </h2>
              {isFreeDomain ? (
                <div className="bg-ink border border-border rounded-card p-4">
                  <p className="text-sm text-text">
                    Your page will be live at <span className="font-mono text-cyan">{subdomain}.goon.app</span>
                  </p>
                  <p className="text-xs text-teal mt-2">No DNS setup needed — we handle everything.</p>
                </div>
              ) : (
                <DnsCard
                  host={subdomain}
                  records={getExpectedDnsRecords(subdomain)}
                  onVerify={handleDnsVerify}
                />
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              {published ? (
                <SuccessCard url={publishedUrl} />
              ) : (
                <>
                  <h2 className="text-base font-medium text-text">Ready to publish</h2>
                  <p className="text-sm text-text-dim">
                    Your page will be live at{" "}
                    <span className="font-mono text-cyan">
                      {isFreeDomain ? `${subdomain}.goon.app` : subdomain}
                    </span>
                  </p>
                  <Button
                    onClick={handlePublish}
                    loading={publishing}
                    size="lg"
                    className="w-full"
                  >
                    Publish now
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        {!published && (
          <div className="flex items-center justify-between">
            <Button
              onClick={handleBack}
              variant="ghost"
              disabled={step === 1}
            >
              <ArrowLeft size={14} />
              Back
            </Button>
            {step < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceedFromStep(step)}
              >
                Next
                <ArrowRight size={14} />
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
