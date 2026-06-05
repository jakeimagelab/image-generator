import { NextRequest, NextResponse } from "next/server";
import { generateFluxVariations, generateImg2ImgVariations } from "@/lib/replicate";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// 포토클리닉 스타일 프롬프트 — 역광·림라이트 유지
const BASE_STYLE = [
  "photorealistic DSLR photograph, Korean medical clinic",
  "Canon EOS R5, 85mm f/1.4L, ISO 320",
  "warm backlight with rim lighting on subjects, bright highlights",
  "natural bokeh background, shallow depth of field",
  "warm ivory and beige interior, soft ambient light",
  "professional medical staff in natural interaction",
  "bright and airy mood, slightly overexposed highlights",
  "high-end Korean clinic editorial photography",
  "shot in RAW, color graded — warm, creamy, film-like",
].join(", ");

// 변화 방향별 추가 프롬프트
const VARIATION_PROMPTS: Record<string, string> = {
  warm:     "warmer color temperature, golden hour glow, richer skin tones",
  cool:     "slightly cooler and cleaner light, morning blue tones",
  bright:   "brighter exposure, lifted shadows, airy feel",
  dramatic: "stronger rim light contrast, deeper shadows, more vivid",
  natural:  "natural documentary feel, candid moment, soft light",
  close:    "tighter framing, closer crop, intimate perspective",
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file      = formData.get("image") as File | null;
    const direction = (formData.get("direction") as string) || "natural";
    const strength  = parseFloat((formData.get("strength") as string) || "0.7");
    const count     = parseInt((formData.get("count") as string) || "4");
    const method    = (formData.get("method") as string) || "redux"; // redux | img2img

    if (!file) return NextResponse.json({ ok: false, error: "이미지 없음" }, { status: 400 });

    // 파일 → base64
    const arrayBuffer = await file.arrayBuffer();
    const base64      = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl     = `data:${file.type || "image/jpeg"};base64,${base64}`;

    let imageUrls: string[];

    if (method === "redux") {
      // Redux: 원본 구조 최대 유지 (이미지 URL 필요 → 일단 data URL로 시도)
      // Flux Redux는 URL이 필요하므로 img2img 방식 사용
      const dirPrompt = VARIATION_PROMPTS[direction] || VARIATION_PROMPTS.natural;
      const fullPrompt = `${BASE_STYLE}, ${dirPrompt}`;
      imageUrls = await generateImg2ImgVariations(dataUrl, fullPrompt, strength, count);
    } else {
      const dirPrompt = VARIATION_PROMPTS[direction] || VARIATION_PROMPTS.natural;
      const fullPrompt = `${BASE_STYLE}, ${dirPrompt}`;
      imageUrls = await generateImg2ImgVariations(dataUrl, fullPrompt, strength, count);
    }

    return NextResponse.json({ ok: true, images: imageUrls });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
