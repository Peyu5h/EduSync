import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const user = request.cookies.get("user");

  // Enhanced debugging
  console.log("---------- MIDDLEWARE START ----------");
  console.log("Path:", request.nextUrl.pathname);
  console.log("Token:", token?.value ? "Exists" : "Missing");
  console.log("User:", user?.value ? "Exists" : "Missing");

  // Skip middleware for specific paths
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.includes(".")
  ) {
    console.log("Path excluded from middleware");
    console.log("---------- MIDDLEWARE END ----------");
    return NextResponse.next();
  }

  // PUBLIC ROUTES - Allow access to auth pages without authentication
  if (
    request.nextUrl.pathname === "/sign-in" ||
    request.nextUrl.pathname === "/sign-up"
  ) {
    // If user is already authenticated, redirect them based on role
    if (token && user) {
      try {
        const userData = JSON.parse(user.value);
        console.log("User already authenticated:", userData.role);

        // Only redirect if not forcing auth page
        if (request.nextUrl.searchParams.get("force") !== "true") {
          const url = request.nextUrl.clone();

          if (userData.role === "CLASS_TEACHER") {
            url.pathname = "/teacher/dashboard";
            console.log("Redirecting teacher to dashboard");
            console.log("---------- MIDDLEWARE END ----------");
            return NextResponse.redirect(url);
          } else {
            url.pathname = "/";
            console.log("Redirecting student to home");
            console.log("---------- MIDDLEWARE END ----------");
            return NextResponse.redirect(url);
          }
        }
      } catch (error) {
        console.error("Error parsing user data in public route:", error);
      }
    }

    console.log("Allowing access to auth page");
    console.log("---------- MIDDLEWARE END ----------");
    return NextResponse.next();
  }

  // PROTECTED ROUTES - Require authentication
  if (!token || !user) {
    console.log("No authentication, redirecting to sign-in");
    console.log("---------- MIDDLEWARE END ----------");
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Check user role for protected routes
  try {
    const userData = JSON.parse(user.value);
    console.log("Authenticated user role:", userData.role);

    // TEACHER ROUTES - Only accessible by teachers
    if (request.nextUrl.pathname.startsWith("/teacher")) {
      if (userData.role !== "CLASS_TEACHER") {
        console.log("Non-teacher accessing teacher route, redirecting to home");
        console.log("---------- MIDDLEWARE END ----------");
        return NextResponse.redirect(new URL("/", request.url));
      }
      console.log("Teacher accessing teacher route, allowed");
    }

    // STUDENT ROUTES - Only accessible by students/non-teachers
    // Add this if needed
  } catch (error) {
    console.error("Error parsing user data in protected route:", error);
    console.log("---------- MIDDLEWARE END ----------");
    const response = NextResponse.redirect(new URL("/sign-in", request.url));
    response.cookies.delete("token");
    response.cookies.delete("user");
    return response;
  }

  console.log("Access allowed");
  console.log("---------- MIDDLEWARE END ----------");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
