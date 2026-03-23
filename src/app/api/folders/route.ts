import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { isAuthenticatedFromRequest } from "@/lib/auth";

export async function GET() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  if (!isAuthenticatedFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const body = await request.json();

  const { data, error } = await supabase
    .from("folders")
    .insert({
      name: body.name,
      description: body.description || "",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
