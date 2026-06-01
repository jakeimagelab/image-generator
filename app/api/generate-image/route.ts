import { NextResponse } from "next/server";
import { generateOpenAIImages } from "@/lib/openai";
import { buildPhotoclinicPrompt, getGenerationCategory } from "@/lib/prompt-builder";
import { getSupabaseAdminClient, isSupabaseConfigured, referenceBucket } from "@/lib/supabase";
import { getBase64DataUrl } from "@/lib/utils";
import type { DirectorState, GeneratedImage } from "@/types/director";

async function ensureRequest(state: DirectorState, generatedPrompt: string) {
  if (state.requestId) return state.requestId;
  if (!isSupabaseConfigured() || state.leadId?.startsWith("local-")) return `local-request-${Date.now()}`;

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("image_requests")
    .insert({
      lead_id: state.leadId,
      image_types: state.style.imageTypes,
      mood_types: state.style.moodTypes,
      space_tone: state.style.spaceTone || null,
      target_patient: state.style.targetPatient || null,
      concern_text: state.reference.concernText,
      reference_url: state.reference.referenceUrl || null,
      generated_prompt: generatedPrompt
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

async function persistGeneratedImage(requestId: string, image: GeneratedImage, base64?: string) {
  if (!isSupabaseConfigured() || requestId.startsWith("local-")) return image.imageUrl;
  const supabase = getSupabaseAdminClient();
  let imageUrl = image.imageUrl;

  if (base64) {
    const path = `generated/${requestId}/${image.variationNo}.png`;
    const { error } = await supabase.storage.from(referenceBucket).upload(path, Buffer.from(base64, "base64"), {
      contentType: "image/png",
      upsert: true
    });
    if (error) throw error;
    imageUrl = supabase.storage.from(referenceBucket).getPublicUrl(path).data.publicUrl;
  }

  const { error } = await supabase.from("generated_images").insert({
    request_id: requestId,
    image_url: imageUrl,
    variation_no: image.variationNo,
    image_category: image.imageCategory
  });
  if (error) throw error;
  return imageUrl;
}

export async function POST(request: Request) {
  try {
    const state = (await request.json()) as DirectorState;
    const generatedPrompt = state.generatedPrompt || buildPhotoclinicPrompt(state);
    const requestId = await ensureRequest(state, generatedPrompt);

    if (!process.env.OPENAI_API_KEY) {
      const placeholders = Array.from({ length: 4 }, (_, index) => ({
        imageUrl: `https://placehold.co/1024x1024/fbf7ef/155855.png?text=PHOTOCLINIC+AI+${index + 1}`,
        variationNo: index + 1,
        imageCategory: getGenerationCategory(state)
      }));
      return NextResponse.json({ requestId, generatedPrompt, generatedImages: placeholders });
    }

    const response = await generateOpenAIImages(generatedPrompt);

    const generatedImages: GeneratedImage[] = [];
    for (const [index, item] of response.entries()) {
      const base64 = item.b64_json;
      const remoteUrl = item.url;
      const initialUrl = base64 ? getBase64DataUrl(base64) : remoteUrl || "";
      const category = getGenerationCategory(state);
      const savedUrl = await persistGeneratedImage(
        requestId,
        { imageUrl: initialUrl, variationNo: index + 1, imageCategory: category },
        base64
      );
      generatedImages.push({ imageUrl: savedUrl, variationNo: index + 1, imageCategory: category });
    }

    return NextResponse.json({ requestId, generatedPrompt, generatedImages });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "이미지 생성에 실패했습니다." }, { status: 500 });
  }
}
