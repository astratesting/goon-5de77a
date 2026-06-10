import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const isProtected =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/generate") ||
        pathname.startsWith("/onboard") ||
        pathname.startsWith("/p/") ||
        pathname.startsWith("/account") ||
        pathname.startsWith("/preview/") ||
        pathname.startsWith("/api/pages") ||
        pathname.startsWith("/api/subdomains") ||
        pathname.startsWith("/api/qa/") ||
        pathname.startsWith("/api/publish/");

      if (isProtected) {
        if (isLoggedIn) return true;
        return Response.redirect(
          new URL(
            `/signin?returnTo=${encodeURIComponent(pathname)}`,
            nextUrl.origin
          )
        );
      }

      if (
        isLoggedIn &&
        (pathname === "/signin" || pathname === "/signup")
      ) {
        return Response.redirect(new URL("/dashboard", nextUrl.origin));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
