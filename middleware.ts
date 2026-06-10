export { auth as middleware } from "./auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/generate/:path*",
    "/onboard/:path*",
    "/p/:path*",
    "/account/:path*",
    "/api/pages/:path*",
    "/api/subdomains/:path*",
  ],
};
