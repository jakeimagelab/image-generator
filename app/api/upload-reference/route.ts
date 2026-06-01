import { NextResponse } from "next/server";
import { getSupabaseAdminClient, isSupabaseConfigured, referenceBucket } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 400 });
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      return NextResponse.json({ error: "PNG, JPG, WEBP 이미지만 업로드할 수 있습니다." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        imageUrl: `data:${file.type};base64,${bytes.toString("base64")}`,
        fileName: file.name
      });
    }

    const supabase = getSupabaseAdminClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `references/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from(referenceBucket).upload(path, bytes, {
      contentType: file.type,
      upsert: false
    });
    if (error) throw error;
    const { data } = supabase.storage.from(referenceBucket).getPublicUrl(path);
    return NextResponse.json({ imageUrl: data.publicUrl, fileName: file.name });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "업로드에 실패했습니다." }, { status: 500 });
  }
}
