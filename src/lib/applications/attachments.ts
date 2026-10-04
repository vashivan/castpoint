export type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

function extFromContentType(ct?: string | null) {
  const c = (ct ?? "").toLowerCase();
  if (c.includes("png")) return "png";
  if (c.includes("webp")) return "webp";
  return "jpg";
}

/** Downloads an image so it can be attached to an e-mail. */
export async function fetchImageAttachment(url: string, filenameBase: string): Promise<MailAttachment> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${url} (${res.status})`);

  const contentType = res.headers.get("content-type") ?? undefined;
  return {
    filename: `${filenameBase}.${extFromContentType(contentType)}`,
    content: Buffer.from(await res.arrayBuffer()),
    contentType,
  };
}

/** "Anna Maria" -> "Anna_Maria" for attachment file names. */
export function fileSafeName(name: string) {
  return name.replace(/\s+/g, "_").replace(/[^\w-]/g, "") || "Artist";
}
