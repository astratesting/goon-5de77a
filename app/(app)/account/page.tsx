import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import TopBar from "@/components/TopBar";
import Button from "@/components/ui/Button";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, createdAt: true },
  });

  if (!user) {
    redirect("/signin");
  }

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  async function handleDeleteAccount() {
    "use server";
    await db.user.delete({ where: { id: session!.user!.id as string } });
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar />
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-lg space-y-8">
          <div>
            <h1 className="text-2xl font-semibold text-text tracking-tight">
              Account
            </h1>
            <p className="text-sm text-text-dim mt-1">
              Manage your account settings.
            </p>
          </div>

          <div className="bg-ink-2 border border-border rounded-card p-4 space-y-3">
            <h2 className="text-sm font-medium text-text">Email</h2>
            <p className="text-base text-text-dim font-mono">{user.email}</p>
            <p className="text-xs text-text-faint">
              Member since{" "}
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="bg-ink-2 border border-border rounded-card p-4 space-y-3">
            <h2 className="text-sm font-medium text-text">Badge</h2>
            <p className="text-sm text-text-dim">
              The &quot;Made with Goon&quot; badge appears on your published pages.
            </p>
          </div>

          <div className="space-y-3">
            <form action={handleSignOut}>
              <Button variant="secondary" type="submit">
                Sign out
              </Button>
            </form>
          </div>

          <div className="border-t border-border pt-6">
            <h2 className="text-sm font-medium text-red mb-2">Danger zone</h2>
            <p className="text-sm text-text-dim mb-3">
              Deleting your account will remove all your pages and release any
              published subdomains. This cannot be undone.
            </p>
            <form action={handleDeleteAccount}>
              <Button variant="danger" type="submit">
                Delete account
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
