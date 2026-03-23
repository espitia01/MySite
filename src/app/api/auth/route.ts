import { NextRequest, NextResponse } from "next/server";
import {
  isAuthenticatedFromRequest,
  setAuthCookie,
  removeAuthCookie,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authenticated = isAuthenticatedFromRequest(request);
  return NextResponse.json({ authenticated });
}

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  setAuthCookie(response);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  removeAuthCookie(response);
  return response;
}
