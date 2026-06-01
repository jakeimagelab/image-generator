import { NextResponse } from "next/server";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import type { ConsultationInput } from "@/types/director";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ConsultationInput & { requestId?: string };
    if (!body.desiredSchedule || !body.budgetRange || !body.shootingScope) {
      return NextResponse.json({ error: "상담 필수값을 입력해주세요." }, { status: 400 });
    }
    if (!isSupabaseConfigured() || body.requestId?.startsWith("local-")) {
      return NextResponse.json({ consultationId: `local-consultation-${Date.now()}` });
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("consultations")
      .insert({
        request_id: body.requestId,
        desired_schedule: body.desiredSchedule,
        budget_range: body.budgetRange,
        shooting_scope: body.shootingScope,
        note: body.note || null
      })
      .select("id")
      .single();

    if (error) throw error;
    return NextResponse.json({ consultationId: data.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "상담 신청 저장에 실패했습니다." }, { status: 500 });
  }
}
