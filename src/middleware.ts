import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals and static files)
     * 3. Static asset files (favicon.ico, sitemap.xml, robots.txt, images, fonts, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";
  const rootDomain =
    process.env.ROOT_DOMAIN ||
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    "localhost:3000";

  // Strip port from hostname and root domain for comparison
  const hostWithoutPort = hostname.split(":")[0];
  const rootDomainWithoutPort = rootDomain.split(":")[0];

  let subdomain: string | null = null;

  // 1. Allow header override for testing or API Gateway integration
  const explicitTenant = req.headers.get("x-tenant-id");
  if (explicitTenant) {
    subdomain = explicitTenant;
  }
  // 2. Extract subdomain from hostname if domain matches rootDomain
  else if (
    hostWithoutPort !== rootDomainWithoutPort &&
    hostWithoutPort.endsWith(`.${rootDomainWithoutPort}`)
  ) {
    subdomain = hostWithoutPort.replace(`.${rootDomainWithoutPort}`, "");
  }

  // Reserved subdomains that shouldn't route to dynamic tenant storefronts
  const reservedSubdomains = new Set([
    "www",
    "app",
    "api",
    "admin",
    "dashboard",
    "mail",
    "superadmin",
  ]);

  // Clone headers to pass tenant information downstream
  const requestHeaders = new Headers(req.headers);

  if (subdomain && !reservedSubdomains.has(subdomain.toLowerCase())) {
    requestHeaders.set("x-subdomain", subdomain);

    // Rewrite path to dynamic [subdomain] route
    // e.g. tenant.localhost:3000/ -> /tenant
    // e.g. tenant.localhost:3000/products -> /tenant/products
    const path = url.pathname === "/" ? "" : url.pathname;
    const rewriteUrl = new URL(`/${subdomain}${path}`, req.url);

    return NextResponse.rewrite(rewriteUrl, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Root domain requests continue as usual to standard pages
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
