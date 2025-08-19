import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary-server";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<any>((res, rej) =>
    cloudinary.uploader
      .upload_stream({ resource_type: "image" }, (err, val) => (err ? rej(err) : res(val)))
      .end(buffer)
  );

  return NextResponse.json({ url: result.secure_url });
}