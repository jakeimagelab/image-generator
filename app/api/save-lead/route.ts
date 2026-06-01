import { NextResponse } from "next/server";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { isEmail, isUrlOrEmpty } from "@/lib/utils";
import type { BasicInfo } from "@/types/director";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BasicInfo;
    if (!body.hospitalName || !body.managerName || !body.phone || !isEmail(body.email) || !isUrlOrEmpty(body.websiteUrl)) {
      return NextResponse.json({ error: "입력값을 확인해주세요." }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ leadId: `local-lead-${Date.now()}` });
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("leads")
      .insert({
        hospital_name: body.hospitalName,
        manager_name: body.managerName,
        phone: body.phone,
        email: body.email,
        website_url: body.websiteUrl || null
      })
      .select("id")
      .single();

    if (error) throw error;
    return NextResponse.json({ leadId: data.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "저장에 실패했습니다." }, { status: 500 });
  }
}
