import { NextResponse } from "next/server";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { buildPhotoclinicPrompt } from "@/lib/prompt-builder";
import type { DirectorState } from "@/types/director";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DirectorState & { generatedPrompt?: string };
    const generatedPrompt = body.generatedPrompt || buildPhotoclinicPrompt(body);

    if (!body.style.hospitalType || !body.style.imageTypes?.length || !body.style.moodTypes?.length) {
      return NextResponse.json({ error: "이미지 방향 선택값이 부족합니다." }, { status: 400 });
    }

    if (!isSupabaseConfigured() || body.leadId?.startsWith("local-")) {
      return NextResponse.json({ requestId: body.requestId || `local-request-${Date.now()}`, generatedPrompt });
    }

    const supabase = getSupabaseAdminClient();
    if (body.leadId) {
      await supabase.from("leads").update({ hospital_type: body.style.hospitalType }).eq("id", body.leadId);
    }

    const { data, error } = await supabase
      .from("image_requests")
      .insert({
        lead_id: body.leadId,
        image_types: body.style.imageTypes,
        mood_types: body.style.moodTypes,
        space_tone: body.style.spaceTone || null,
        target_patient: body.style.targetPatient || null,
        concern_text: body.reference.concernText,
        reference_url: body.reference.referenceUrl || null,
        generated_prompt: generatedPrompt
      })
      .select("id")
      .single();

    if (error) throw error;

    if (body.reference.uploadedReferences?.length) {
      const references = body.reference.uploadedReferences.map((item) => ({
        request_id: data.id,
        image_url: item.imageUrl,
        file_name: item.fileName
      }));
      const { error: referenceError } = await supabase.from("uploaded_references").insert(references);
      if (referenceError) throw referenceError;
    }

    return NextResponse.json({ requestId: data.id, generatedPrompt });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "저장에 실패했습니다." }, { status: 500 });
  }
}
