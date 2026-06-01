"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { ChoiceCard } from "@/components/ui/ChoiceCard";
import { buildDetailedGenerationPrompt, summarizePrompt } from "@/lib/prompt-builder";
import { loadDirectorState, saveDirectorState } from "@/lib/director-store";
import type { DirectorState, GenerationMode, GeneratorInput } from "@/types/director";

type Errors = Partial<Record<keyof GeneratorInput, string>>;

const modeLabels: Record<GenerationMode, string> = {
  scene: "사진 장면 생성",
  avatar: "의료진 아바타 생성"
};

export function BasicInfoForm() {
  const router = useRouter();
  const [state, setState] = useState<DirectorState | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => setState(loadDirectorState()), []);

  const prompt = useMemo(() => (state ? buildDetailedGenerationPrompt(state.generator) : ""), [state]);

  if (!state) return null;

  const update = (key: keyof GeneratorInput, value: string) => {
    const next = { ...state, generator: { ...state.generator, [key]: value } };
    setState(next);
    saveDirectorState(next);
  };

  const updateMode = (mode: GenerationMode) => {
    const next = { ...state, generator: { ...state.generator, mode } };
    setState(next);
    saveDirectorState(next);
  };

  const validate = () => {
    const nextErrors: Errors = {};
    if (!state.generator.department.trim()) nextErrors.department = "진료과를 입력해주세요.";
    if (!state.generator.scene.trim()) nextErrors.scene = "생성할 장면을 입력해주세요.";
    if (!state.generator.doctorDescription.trim()) nextErrors.doctorDescription = "원장 또는 주요 인물 설명을 입력해주세요.";
    if (!state.generator.content.trim()) nextErrors.content = "핵심 내용을 입력해주세요.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    const generatedPrompt = buildDetailedGenerationPrompt(state.generator);
    saveDirectorState({ ...state, generatedPrompt, generatedImages: [] });
    router.push("/director/generate");
  };

  return (
    <form onSubmit={submit} className="grid gap-7">
      <section>
        <h2 className="mb-3 text-lg font-black text-clinic-green">생성 방식</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(modeLabels) as GenerationMode[]).map((mode) => (
            <ChoiceCard key={mode} label={modeLabels[mode]} selected={state.generator.mode === mode} onClick={() => updateMode(mode)} />
          ))}
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="진료과" error={errors.department}>
          <TextInput value={state.generator.department} onChange={(e) => update("department", e.target.value)} placeholder="예: 피부과" />
        </Field>
        <Field label="장면" error={errors.scene}>
          <TextInput value={state.generator.scene} onChange={(e) => update("scene", e.target.value)} placeholder="예: 원장님 시술 / 상담하는 장면" />
        </Field>
      </div>

      <Field label={state.generator.mode === "avatar" ? "아바타 인물 설명" : "원장 / 주요 인물"} error={errors.doctorDescription}>
        <TextInput
          value={state.generator.doctorDescription}
          onChange={(e) => update("doctorDescription", e.target.value)}
          placeholder="예: 아담한 키의 한국인 여성 원장, 부드러운 인상"
        />
      </Field>

      <Field label="내용" error={errors.content}>
        <TextArea
          value={state.generator.content}
          onChange={(e) => update("content", e.target.value)}
          placeholder="예: 주사 시술 장면(필러), 환자에게 편안하게 설명하며 준비하는 모습"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="인테리어">
          <TextInput value={state.generator.interior} onChange={(e) => update("interior", e.target.value)} placeholder="예: 따뜻한 아이보리 컬러, 우드 포인트" />
        </Field>
        <Field label="직원 유무">
          <TextInput value={state.generator.staffPresence} onChange={(e) => update("staffPresence", e.target.value)} placeholder="예: 1명 간호사 동행" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="환자 / 함께 등장하는 인물">
          <TextInput value={state.generator.patientDescription} onChange={(e) => update("patientDescription", e.target.value)} placeholder="예: 30대 여성 환자, 편안한 표정" />
        </Field>
        <Field label="분위기">
          <TextInput value={state.generator.mood} onChange={(e) => update("mood", e.target.value)} placeholder="예: 따뜻하고 신뢰감 있는" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="사진 느낌">
          <TextInput value={state.generator.cameraStyle} onChange={(e) => update("cameraStyle", e.target.value)} placeholder="예: 포토클리닉 실제 촬영 느낌, 자연광, 50mm 렌즈" />
        </Field>
        <Field label="활용 목적">
          <TextInput value={state.generator.usage} onChange={(e) => update("usage", e.target.value)} placeholder="예: 홈페이지 메인, SNS 광고" />
        </Field>
      </div>

      <Field label="추가 요청">
        <TextArea
          value={state.generator.extraRequest}
          onChange={(e) => update("extraRequest", e.target.value)}
          placeholder="피하고 싶은 표현, 원하는 구도, 의상, 배경 등을 자유롭게 적어주세요."
        />
      </Field>

      <section className="rounded-[2rem] border border-clinic-green/10 bg-clinic-ivory p-5">
        <p className="mb-2 text-sm font-bold text-clinic-orange">자동 프롬프트 미리보기</p>
        <p className="text-sm leading-7 text-clinic-green/75">{summarizePrompt(prompt)}</p>
      </section>

      <Button type="submit" className="mt-1 w-full sm:w-auto sm:justify-self-end">
        AI 이미지 생성하기
      </Button>
    </form>
  );
}
