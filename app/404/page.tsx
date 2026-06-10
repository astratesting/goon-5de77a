import Link from "next/link";

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <span className="text-6xl font-mono font-bold text-text-faint mb-4">
        404
      </span>
      <h1 className="text-2xl font-semibold text-text mb-2">Page not found</h1>
      <p className="text-text-dim mb-6">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 h-10 px-4 bg-indigo text-white text-sm font-medium rounded-input hover:brightness-110 transition-all duration-120"
      >
        Go home
      </Link>
    </div>
  );
}
