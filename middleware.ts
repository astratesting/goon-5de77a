export { auth as middleware } from "./auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/generate/:path*",
    "/onboard/:path*",
    "/p/:path*",
    "/account/:path*",
    "/preview/:path*",
    "/api/pages/:path*",
    "/api/subdomains/:path*",
    "/api/qa/:path*",
    "/api/publish/:path*",
  ],
};
