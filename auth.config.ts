import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/generate") ||
        nextUrl.pathname.startsWith("/onboard") ||
        nextUrl.pathname.startsWith("/p/") ||
        nextUrl.pathname.startsWith("/account") ||
        nextUrl.pathname.startsWith("/api/pages") ||
        nextUrl.pathname.startsWith("/api/subdomains");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return Response.redirect(
          new URL(
            `/signin?returnTo=${encodeURIComponent(nextUrl.pathname)}`,
            nextUrl.origin
          )
        );
      }

      if (
        isLoggedIn &&
        (nextUrl.pathname === "/signin" || nextUrl.pathname === "/signup")
      ) {
        return Response.redirect(new URL("/dashboard", nextUrl.origin));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
