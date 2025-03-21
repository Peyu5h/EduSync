import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const user = request.cookies.get("user");

  // Debug log
  console.log("Middleware checking path:", request.nextUrl.pathname);
  console.log("User cookie exists:", !!user);

  // Protection for authenticated routes - redirect to login if no token/user
  if (!token || !user) {
    // Allow access to auth pages even without tokens
    if (
      request.nextUrl.pathname === "/sign-in" ||
      request.nextUrl.pathname === "/sign-up"
    ) {
      return NextResponse.next();
    }

    // Redirect to sign-in for non-auth pages when no token/user
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  // Parse user data to check role
  let userData = null;
  try {
    userData = JSON.parse(user.value);
    console.log("User role in middleware:", userData.role);
  } catch (error) {
    console.error("Error parsing user data:", error);
    // If we can't parse the user data, clear cookies and redirect to sign-in
    const response = NextResponse.redirect(new URL("/sign-in", request.url));
    response.cookies.delete("token");
    response.cookies.delete("user");
    return response;
  }

  // Handle sign-in/sign-up redirects for already authenticated users
  if (
    request.nextUrl.pathname === "/sign-in" ||
    request.nextUrl.pathname === "/sign-up"
  ) {
    // Skip redirection if explicitly requested via query param
    if (request.nextUrl.searchParams.get("force") === "true") {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();

    // Redirect based on user role
    if (userData && userData.role === "CLASS_TEACHER") {
      url.pathname = "/teacher";
    } else {
      url.pathname = "/";
    }

    return NextResponse.redirect(url);
  }

  // Teacher route protection
  if (request.nextUrl.pathname.startsWith("/teacher")) {
    if (userData && userData.role !== "CLASS_TEACHER") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
