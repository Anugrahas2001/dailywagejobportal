import { NextResponse } from "next/server";

export async function middleware(request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    throw new Error("Authorization header missing");
  }

  const token = authHeader.split("Bearer ")[1];

  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized - Invalid or missing token" },
      { status: 401 },
    );
  }
  console.log("MIDDLEWARE EXECUTING");

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
