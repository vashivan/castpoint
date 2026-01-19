// lib/cloudinaryUpload.ts
export type UploadedImage = {
  secure_url: string;
  public_id: string;
  bytes: number;
  width?: number;
  height?: number;
  format?: string;
};

export async function uploadToCloudinary(file: File): Promise<UploadedImage> {
  const url = `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/image/upload`;

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", "castpoint_temp");
  form.append("folder", "temp");
  // form.append("tags", "castpoint_temp"); // optional

  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) throw new Error("Cloudinary upload failed");

  const data = await res.json();
  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    bytes: data.bytes,
    width: data.width,
    height: data.height,
    format: data.format,
  };
}
