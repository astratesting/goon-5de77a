"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, ExternalLink, Copy, CheckCircle } from "lucide-react";
import Modal from "./ui/Modal";
import Input from "./ui/Input";
import Button from "./ui/Button";

interface PublishDialogProps {
  open: boolean;
  onClose: () => void;
  pageId: string;
  currentSlug?: string | null;
  pageTitle: string;
}

export default function PublishDialog({
  open,
  onClose,
  pageId,
  currentSlug,
  pageTitle,
}: PublishDialogProps) {
  const [slug, setSlug] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      if (currentSlug) {
        setSlug(currentSlug);
      } else {
        const suggested = pageTitle
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/[\s]+/g, "-")
          .replace(/-+/g, "-")
          .slice(0, 39);
        setSlug(suggested || "my-page");
      }
      setPublished(false);
      setAvailable(null);
      setError("");
    }
  }, [open, currentSlug, pageTitle]);

  const checkAvailability = useCallback(async (s: string) => {
    if (!s) return;
    setChecking(true);
    try {
      const res = await fetch(`/api/subdomains/check?slug=${encodeURIComponent(s)}`);
      const data = await res.json();
      setAvailable(data.available);
    } catch {
      setAvailable(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (!slug || slug === currentSlug) {
      setAvailable(null);
      return;
    }
    const timer = setTimeout(() => checkAvailability(slug), 400);
    return () => clearTimeout(timer);
  }, [slug, currentSlug, checkAvailability]);

  const handlePublish = async () => {
    setPublishing(true);
    setError("");
    try {
      const res = await fetch(`/api/pages/${pageId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Publish failed");
        return;
      }
      setPublishedUrl(data.url);
      setPublished(true);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPublishing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publishedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={published ? "Published" : "Publish to the web"}>
      {published ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal/10 text-teal text-xs font-medium rounded">
              <CheckCircle size={12} />
              Live
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-10 px-3 bg-ink-3 border border-border rounded-input flex items-center font-mono text-sm text-text truncate">
              {publishedUrl}
            </div>
            <button
              onClick={handleCopy}
              className="h-10 w-10 flex items-center justify-center border border-border rounded-input text-text-dim hover:text-text hover:border-text-faint transition-all duration-120"
            >
              {copied ? <Check size={16} className="text-teal" /> : <Copy size={16} />}
            </button>
          </div>
          <a
            href={publishedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-indigo hover:brightness-110"
          >
            Open <ExternalLink size={14} />
          </a>
          <p className="text-xs text-text-faint">
            Any changes you make will redeploy automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-0">
            <Input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                setAvailable(null);
              }}
              placeholder="your-slug"
              className="font-mono rounded-r-none"
            />
            <span className="h-10 px-3 flex items-center bg-ink-3 border border-l-0 border-border rounded-r-input text-sm text-text-faint">
              .goon.so
            </span>
          </div>

          {slug && slug !== currentSlug && (
            <div className="flex items-center gap-1.5 text-sm">
              {checking ? (
                <span className="text-text-faint">Checking…</span>
              ) : available === true ? (
                <>
                  <Check size={14} className="text-teal" />
                  <span className="text-teal">Available</span>
                </>
              ) : available === false ? (
                <>
                  <X size={14} className="text-red" />
                  <span className="text-red">Taken</span>
                </>
              ) : null}
            </div>
          )}

          {currentSlug && slug === currentSlug && (
            <p className="text-sm text-text-dim">
              Redeploy to <span className="font-mono text-text">{slug}.goon.so</span>?
            </p>
          )}

          <label className="flex items-center gap-2 text-sm text-text-dim">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border-border bg-ink-2 text-indigo accent-indigo"
            />
            Make this page indexable by Google
          </label>

          {error && (
            <p className="text-sm text-red">{error}</p>
          )}

          <Button
            onClick={handlePublish}
            loading={publishing}
            disabled={!slug || (slug !== currentSlug && available === false)}
            className="w-full"
            size="lg"
          >
            {currentSlug ? "Redeploy" : "Claim & publish"}
          </Button>
        </div>
      )}
    </Modal>
  );
}
