"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ChoiceCard } from "@/components/ui/ChoiceCard";
import { Field, TextInput } from "@/components/ui/Field";
import { hospitalTypes, imageTypeOptions, moodOptions, type DirectorState, type ImageType, type MoodType } from "@/types/director";
import { loadDirectorState, saveDirectorState } from "@/lib/director-store";

export function StyleSelector() {
  const router = useRouter();
  const [state, setState] = useState<DirectorState | null>(null);
  const [error, setError] = useState("");

  useEffect(() => setState(loadDirectorState()), []);
  if (!state) return null;

  const persist = (next: DirectorState) => {
    setState(next);
    saveDirectorState(next);
  };

  const toggleImageType = (value: ImageType) => {
    const values = state.style.imageTypes.includes(value)
      ? state.style.imageTypes.filter((item) => item !== value)
      : [...state.style.imageTypes, value];
    persist({ ...state, style: { ...state.style, imageTypes: values } });
  };

  const toggleMood = (value: MoodType) => {
    const values = state.style.moodTypes.includes(value)
      ? state.style.moodTypes.filter((item) => item !== value)
      : [...state.style.moodTypes, value];
    persist({ ...state, style: { ...state.style, moodTypes: values } });
  };

  const submit = () => {
    if (!state.style.hospitalType || state.style.imageTypes.length === 0 || state.style.moodTypes.length === 0) {
      setError("병원 유형, 이미지 유형, 분위기를 각각 1개 이상 선택해주세요.");
      return;
    }
    router.push("/director/reference");
  };

  return (
    <div className="grid gap-10">
      <section>
        <h2 className="mb-4 text-xl font-bold text-clinic-green">병원 유형</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {hospitalTypes.map((type) => (
            <ChoiceCard
              key={type}
              label={type}
              selected={state.style.hospitalType === type}
              onClick={() => persist({ ...state, style: { ...state.style, hospitalType: type } })}
            />
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-xl font-bold text-clinic-green">원하는 이미지 유형</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {imageTypeOptions.map((type) => (
            <ChoiceCard key={type} label={type} multiple selected={state.style.imageTypes.includes(type)} onClick={() => toggleImageType(type)} />
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-xl font-bold text-clinic-green">분위기 / 무드</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {moodOptions.map((mood) => (
            <ChoiceCard key={mood} label={mood} multiple selected={state.style.moodTypes.includes(mood)} onClick={() => toggleMood(mood)} />
          ))}
        </div>
      </section>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="공간톤 보완 입력">
          <TextInput
            value={state.style.spaceTone}
            onChange={(e) => persist({ ...state, style: { ...state.style, spaceTone: e.target.value } })}
            placeholder="예: 아이보리와 우드톤 상담실"
          />
        </Field>
        <Field label="주요 타깃 환자">
          <TextInput
            value={state.style.targetPatient}
            onChange={(e) => persist({ ...state, style: { ...state.style, targetPatient: e.target.value } })}
            placeholder="예: 30-40대 여성 환자"
          />
        </Field>
      </div>
      {error ? <p className="rounded-2xl bg-clinic-orange/10 px-4 py-3 text-sm font-semibold text-clinic-orange">{error}</p> : null}
      <Button onClick={submit} className="w-full sm:w-auto sm:justify-self-end">
        참고자료 입력하기
      </Button>
    </div>
  );
}
