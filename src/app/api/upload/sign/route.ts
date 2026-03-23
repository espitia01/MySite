import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { isAuthenticatedFromRequest } from "@/lib/auth";

const ALLOWED_BUCKETS = ["pdfs", "images"];

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

export async function POST(request: NextRequest) {
  if (!isAuthenticatedFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { filename, contentType, bucket } = body as {
    filename: string;
    contentType: string;
    bucket: string;
  };

  if (!filename || !contentType || !bucket) {
    return NextResponse.json(
      { error: "filename, contentType, and bucket are required" },
      { status: 400 }
    );
  }

  if (!ALLOWED_BUCKETS.includes(bucket)) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }

  if (bucket === "pdfs" && contentType !== "application/pdf") {
    return NextResponse.json(
      { error: "Only PDF files allowed in pdfs bucket" },
      { status: 400 }
    );
  }

  if (bucket === "images" && !ALLOWED_IMAGE_TYPES.has(contentType)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, GIF, WebP, and SVG images are allowed" },
      { status: 400 }
    );
  }

  const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    path,
    publicUrl,
  });
}
