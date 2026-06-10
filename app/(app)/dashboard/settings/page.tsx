"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import TopBar from "@/components/TopBar";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { showToast } from "@/components/ui/Toast";
import { Shield, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [claimedSubdomain, setClaimedSubdomain] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      setName(session.user.name || "");
    }
  }, [session]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Profile save endpoint would go here
      showToast({ type: "success", message: "Profile saved" });
    } catch {
      showToast({ type: "error", message: "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <TopBar showSearch={false} showNewPage={false} />

      <div className="flex-1 overflow-auto p-6 max-w-[640px] mx-auto w-full space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-text">Settings</h1>
          <p className="text-sm text-text-dim mt-0.5">Manage your account</p>
        </div>

        {/* Profile */}
        <div className="bg-ink-2 border border-border rounded-card p-6 space-y-4">
          <h2 className="text-sm font-medium text-text flex items-center gap-2">
            <Shield size={14} className="text-cyan" />
            Profile
          </h2>
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <Input
            label="Email"
            value={session?.user?.email || ""}
            disabled
          />
          <Button onClick={handleSaveProfile} loading={saving} size="sm">
            Save changes
          </Button>
        </div>

        {/* Subdomain claim */}
        <div className="bg-ink-2 border border-border rounded-card p-6 space-y-4">
          <h2 className="text-sm font-medium text-text">Claimed Subdomain</h2>
          <p className="text-xs text-text-dim">You can claim one subdomain as your profile URL.</p>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="Subdomain"
                value={claimedSubdomain}
                onChange={(e) => setClaimedSubdomain(e.target.value.toLowerCase())}
                placeholder="your-name"
              />
            </div>
            <span className="text-sm text-text-faint pb-2">.goon.app</span>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-ink-2 border border-red/20 rounded-card p-6 space-y-4">
          <h2 className="text-sm font-medium text-red flex items-center gap-2">
            <Trash2 size={14} />
            Danger Zone
          </h2>
          <p className="text-xs text-text-dim">
            Delete your account and all associated data. This cannot be undone.
          </p>
          <Input
            label="Type DELETE to confirm"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="DELETE"
          />
          <Button
            variant="danger"
            size="sm"
            disabled={deleteConfirm !== "DELETE"}
          >
            Delete account
          </Button>
        </div>
      </div>
    </div>
  );
}
