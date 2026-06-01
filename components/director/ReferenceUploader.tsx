"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { buildPhotoclinicPrompt, summarizePrompt } from "@/lib/prompt-builder";
import { loadDirectorState, saveDirectorState } from "@/lib/director-store";
import { isUrlOrEmpty } from "@/lib/utils";
import type { DirectorState, UploadedReference } from "@/types/director";

export function ReferenceUploader() {
  const router = useRouter();
  const [state, setState] = useState<DirectorState | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setState(loadDirectorState()), []);
  const prompt = useMemo(() => (state ? buildPhotoclinicPrompt(state) : ""), [state]);

  if (!state) return null;

  const persist = (next: DirectorState) => {
    setState(next);
    saveDirectorState(next);
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    const available = 3 - state.reference.uploadedReferences.length;
    const selected = Array.from(files).slice(0, available);
    setUploading(true);
    setError("");
    try {
      const uploaded: UploadedReference[] = [];
      for (const file of selected) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/upload-reference", { method: "POST", body: formData });
        const data = (await response.json()) as UploadedReference & { error?: string };
        if (!response.ok) throw new Error(data.error || "이미지 업로드에 실패했습니다.");
        uploaded.push({ imageUrl: data.imageUrl, fileName: data.fileName });
      }
      persist({
        ...state,
        reference: {
          ...state.reference,
          uploadedReferences: [...state.reference.uploadedReferences, ...uploaded]
        }
      });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "이미지 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!isUrlOrEmpty(state.reference.referenceUrl)) {
      setError("참고 URL 형식이 올바르지 않습니다.");
      return;
    }
    if (!state.reference.concernText.trim()) {
      setError("현재 병원 이미지 고민을 입력해주세요.");
      return;
    }
    const generatedPrompt = buildPhotoclinicPrompt(state);
    const response = await fetch("/api/save-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...state, generatedPrompt })
    });
    const data = (await response.json()) as { requestId?: string; error?: string };
    const next = { ...state, requestId: data.requestId ?? state.requestId, generatedPrompt };
    persist(next);
    router.push("/director/generate");
  };

  return (
    <div className="grid gap-8">
      <div className="grid gap-5">
        <Field label="참고 이미지 업로드 (최대 3장)">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            disabled={uploading || state.reference.uploadedReferences.length >= 3}
            onChange={(event) => upload(event.target.files)}
            className="focus-ring block w-full rounded-2xl border border-dashed border-clinic-green/25 bg-white px-4 py-5 text-sm text-clinic-green"
          />
        </Field>
        {state.reference.uploadedReferences.length ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {state.reference.uploadedReferences.map((image) => (
              <div key={image.imageUrl} className="overflow-hidden rounded-2xl border border-clinic-green/10 bg-white">
                <img src={image.imageUrl} alt={image.fileName} className="aspect-[4/3] w-full object-cover" />
                <p className="truncate px-3 py-2 text-xs text-clinic-green/70">{image.fileName}</p>
              </div>
            ))}
          </div>
        ) : null}
        <Field label="참고 URL">
          <TextInput
            value={state.reference.referenceUrl}
            onChange={(e) => persist({ ...state, reference: { ...state.reference, referenceUrl: e.target.value } })}
            placeholder="https://..."
          />
        </Field>
        <Field label="현재 병원 이미지 고민">
          <TextArea
            value={state.reference.concernText}
            onChange={(e) => persist({ ...state, reference: { ...state.reference, concernText: e.target.value } })}
            placeholder="예: 병원이 너무 차갑게 보임 / 상담 장면이 부족함 / 여성 환자에게 더 친근하게 보이고 싶음"
          />
        </Field>
      </div>
      <section className="rounded-[2rem] border border-clinic-green/10 bg-white p-5 shadow-soft">
        <p className="mb-2 text-sm font-bold text-clinic-orange">자동 생성 프롬프트 미리보기</p>
        <p className="text-sm leading-7 text-clinic-green/80">{summarizePrompt(prompt)}</p>
      </section>
      {error ? <p className="rounded-2xl bg-clinic-orange/10 px-4 py-3 text-sm font-semibold text-clinic-orange">{error}</p> : null}
      <Button onClick={submit} disabled={uploading} className="w-full sm:w-auto sm:justify-self-end">
        AI 이미지 생성하기
      </Button>
    </div>
  );
}
