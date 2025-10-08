// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Bind Supabase to this req/res so auth cookies are read/written correctly
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Allow public admin auth routes
  const pathname = req.nextUrl.pathname;
  const publicAdminRoutes = ["/admin/login"]; // add "/admin/register", etc. if you have them

  // If hitting /admin/* and not on a public route, require auth
  if (pathname.startsWith("/admin") && !publicAdminRoutes.includes(pathname)) {
    if (!user) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname + req.nextUrl.search); // return after login
      return NextResponse.redirect(url);
    }
  }

  return res;
}

// Only run on /admin/*
export const config = {
  matcher: ["/admin/:path*"],
};
