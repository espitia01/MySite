import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { isAuthenticatedFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  const category = request.nextUrl.searchParams.get("category");
  const folderId = request.nextUrl.searchParams.get("folder");

  let query = supabase
    .from("notes")
    .select("*, folders(id, name)")
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  if (folderId) {
    query = query.eq("folder_id", folderId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  if (!isAuthenticatedFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const body = await request.json();

  const { data, error } = await supabase
    .from("notes")
    .insert({
      title: body.title,
      category: body.category,
      description: body.description || "",
      pdf_url: body.pdf_url || "",
      pdf_filename: body.pdf_filename || "",
      folder_id: body.folder_id || null,
    })
    .select("*, folders(id, name)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
