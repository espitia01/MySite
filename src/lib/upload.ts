interface UploadResult {
  url: string;
  filename: string;
}

export async function uploadFile(
  file: File,
  bucket: "pdfs" | "images"
): Promise<UploadResult> {
  const signRes = await fetch("/api/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      bucket,
    }),
  });

  if (!signRes.ok) {
    let msg = "Failed to get upload URL";
    try {
      const d = await signRes.json();
      msg = d.error || msg;
    } catch {}
    throw new Error(msg);
  }

  const { signedUrl, publicUrl } = await signRes.json();

  const uploadRes = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error(`Upload failed (${uploadRes.status})`);
  }

  return { url: publicUrl, filename: file.name };
}
