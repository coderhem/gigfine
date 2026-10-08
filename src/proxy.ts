import { NextResponse, type NextRequest } from "next/server";

// Same build runs as three instances:
//   APP_MODE=user     -> public site (port 8088), /admin and /business are hidden
//   APP_MODE=admin    -> admin panel (port 8089), "/" opens the dashboard
//   APP_MODE=business -> business site (port 8090), only /business/* and legal pages
// `next dev` (no APP_MODE) serves everything from one server.
const BUSINESS_SHARED = ["/privacy-policy", "/terms-&-conditions"];

const under = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(`${base}/`);

export function proxy(req: NextRequest) {
  if (process.env.NODE_ENV === "development" && !process.env.APP_MODE) {
    return NextResponse.next();
  }
  const mode = process.env.APP_MODE ?? "user";
  const { pathname } = req.nextUrl;
  const isAdminPath = under(pathname, "/admin");
  const isBusinessPath = under(pathname, "/business");

  if (mode === "admin") {
    if (pathname === "/" || pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (mode === "business") {
    if (isBusinessPath || BUSINESS_SHARED.some((p) => under(pathname, p))) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/business", req.url));
  }

  if (isAdminPath || isBusinessPath) {
    return new NextResponse("Not Found", { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
