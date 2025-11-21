import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const requestedPath = request.nextUrl.pathname;
  const isDashboardRoute = requestedPath.startsWith("/dashboard");
  const isCandidateRoute = requestedPath.startsWith("/dashboard/candidate");
  const isAuthRoute =
    requestedPath === "/login" || requestedPath === "/signup";

  if (isDashboardRoute) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", requestedPath);
      return NextResponse.redirect(loginUrl);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!profile) {
      const signupUrl = new URL("/signup", request.url);
      return NextResponse.redirect(signupUrl);
    }

    if (profile.role === "candidate" && !isCandidateRoute) {
      const candidateUrl = new URL("/dashboard/candidate", request.url);
      return NextResponse.redirect(candidateUrl);
    }

    if (profile.role === "hr" && isCandidateRoute) {
      const hrUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(hrUrl);
    }
  }

  if (isAuthRoute && session) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};

