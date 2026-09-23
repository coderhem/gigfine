import { NextResponse, type NextRequest } from "next/server";

// Same build runs as two instances:
//   APP_MODE=user  -> public site (port 8088), /admin is hidden
//   APP_MODE=admin -> admin panel (port 8089), "/" opens the dashboard
export function proxy(req: NextRequest) {
  const mode = process.env.APP_MODE ?? "user";
  const { pathname } = req.nextUrl;
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

  if (mode === "admin") {
    if (pathname === "/" || pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (isAdminPath) {
    return new NextResponse("Not Found", { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
