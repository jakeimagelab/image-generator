"use client";

import { useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { loadDirectorState } from "@/lib/director-store";
import type { ConsultationInput, DirectorState } from "@/types/director";

const initial: ConsultationInput = {
  desiredSchedule: "",
  budgetRange: "",
  shootingScope: "",
  note: ""
};

export function ConsultationForm() {
  const [state, setState] = useState<DirectorState | null>(null);
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setState(loadDirectorState()), []);

  const update = (key: keyof ConsultationInput, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.desiredSchedule || !form.budgetRange || !form.shootingScope) {
      setStatus("희망 촬영 시기, 예산 범위, 원하는 촬영 범위를 입력해주세요.");
      return;
    }
    setSubmitting(true);
    const response = await fetch("/api/save-consultation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: state?.requestId, ...form })
    });
    setSubmitting(false);
    setStatus(response.ok ? "상담 신청이 저장되었습니다. 포토클리닉 상담팀이 촬영 방향을 정리해 연락드릴 수 있습니다." : "상담 신청 저장에 실패했습니다.");
  };

  return (
    <form onSubmit={submit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="희망 촬영 시기">
          <TextInput value={form.desiredSchedule} onChange={(e) => update("desiredSchedule", e.target.value)} placeholder="예: 7월 첫째 주 / 최대한 빠르게" />
        </Field>
        <Field label="예산 범위">
          <TextInput value={form.budgetRange} onChange={(e) => update("budgetRange", e.target.value)} placeholder="예: 300-500만원" />
        </Field>
      </div>
      <Field label="원하는 촬영 범위">
        <TextInput value={form.shootingScope} onChange={(e) => update("shootingScope", e.target.value)} placeholder="예: 원장 프로필, 상담 장면, 공간 무드컷" />
      </Field>
      <Field label="추가 요청사항">
        <TextArea value={form.note} onChange={(e) => update("note", e.target.value)} placeholder="실제 촬영에서 꼭 반영하고 싶은 톤이나 장면을 적어주세요." />
      </Field>
      {status ? <p className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-clinic-green shadow-sm">{status}</p> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <ButtonLink href="/director/result" variant="outline">
          결과 다시 보기
        </ButtonLink>
        <Button type="submit" disabled={submitting}>
          상담 신청 저장하기
        </Button>
      </div>
    </form>
  );
}
