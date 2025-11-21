import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // This prevents unnecessary auth client initialization for public pages
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/guest/purchases');
  
  if (isProtectedRoute) {
    try {
      await supabase.auth.getSession();
    } catch (error) {
      console.error('[v0] Error refreshing session:', error);
    }
  }

  return supabaseResponse;
}
