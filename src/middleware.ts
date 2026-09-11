import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

  // Check if there is an explicit x-tenant-id header (useful for API & testing)
  const explicitTenant = req.headers.get("x-tenant-id");

  // Determine current subdomain
  // Handles:
  // - techstore.localhost:3000
  // - techstore.yourdomain.com
  let currentHost = hostname.replace(`:${url.port}`, "");
  const cleanRootDomain = rootDomain.split(":")[0];

  let subdomain: string | null = null;
  if (explicitTenant) {
    subdomain = explicitTenant;
  } else if (currentHost.endsWith(cleanRootDomain) && currentHost !== cleanRootDomain) {
    // Extract subdomain before root domain
    subdomain = currentHost.replace(`.${cleanRootDomain}`, "");
  }

  // If request is for an API route or static files, don't rewrite
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // If accessing a merchant or admin route directly on root domain
  if (url.pathname.startsWith("/merchant") || url.pathname.startsWith("/superadmin")) {
    return NextResponse.next();
  }

  // If subdomain is present and not reserved (app, www, api, admin)
  if (subdomain && !["www", "app", "api", "admin"].includes(subdomain.toLowerCase())) {
    // Rewrite path to /store/[subdomain]
    if (!url.pathname.startsWith(`/store/${subdomain}`)) {
      url.pathname = `/store/${subdomain}${url.pathname === "/" ? "" : url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}
