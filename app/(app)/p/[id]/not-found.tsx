import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-4xl font-semibold text-text mb-2">Page not found</h1>
      <p className="text-text-dim mb-6">
        This page doesn&apos;t exist or you don&apos;t have access.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 h-10 px-4 bg-indigo text-white text-sm font-medium rounded-input hover:brightness-110 transition-all duration-120"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
