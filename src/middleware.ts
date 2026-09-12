import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals and static files)
     * 3. Static asset files (favicon.ico, sitemap.xml, robots.txt, images, fonts, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images/|uploads/|.*\\..*).*)",
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";
  const rootDomain =
    process.env.ROOT_DOMAIN ||
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    "localhost:3000";

  // 1. Direct path routing protection:
  // หากผู้ใช้เข้าถึงผ่านเส้นทางตรง เช่น /3nfm, /apex, /dashboard ให้ปล่อยผ่านทันทีโดยไม่ rewrite
  const directAllowedPaths = ["/3nfm", "/apex", "/dashboard"];
  if (
    directAllowedPaths.includes(url.pathname.toLowerCase()) ||
    url.pathname.toLowerCase().startsWith("/dashboard/")
  ) {
    return NextResponse.next();
  }

  // Strip port from hostname and root domain for comparison
  const hostWithoutPort = hostname.split(":")[0];
  const rootDomainWithoutPort = rootDomain.split(":")[0];

  // 2. ป้องกัน Domain อัตโนมัติของ Vercel (*.vercel.app) ไม่ให้ถูกตีความเป็นเทแนนต์ Subdomain
  if (hostWithoutPort.endsWith(".vercel.app")) {
    return NextResponse.next();
  }

  let subdomain: string | null = null;

  // 3. Allow header override for testing or API Gateway integration
  const explicitTenant = req.headers.get("x-tenant-id");
  if (explicitTenant) {
    subdomain = explicitTenant;
  }
  // 4. Extract subdomain from hostname if domain matches rootDomain
  // เช่น apex.localhost:3000 -> subdomain: apex
  // เช่น 3nfm.3nfm.shop -> subdomain: 3nfm
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

    // หาก pathname มีชื่อ subdomain อยู่แล้ว ไม่ต้องซ้ำเติม
    if (url.pathname.toLowerCase().startsWith(`/${subdomain.toLowerCase()}`)) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // Rewrite path to dynamic [subdomain] route
    // e.g. 3nfm.localhost:3000/ -> /3nfm
    // e.g. apex.localhost:3000/products -> /apex/products
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
