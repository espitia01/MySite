import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const COOKIE_VALUE = "authenticated";

export function isAuthenticatedFromRequest(request: NextRequest): boolean {
  return request.cookies.get(COOKIE_NAME)?.value === COOKIE_VALUE;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === COOKIE_VALUE;
}

export function setAuthCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export function removeAuthCookie(response: NextResponse): void {
  response.cookies.delete(COOKIE_NAME);
}
