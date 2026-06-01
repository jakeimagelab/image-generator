"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { loadDirectorState } from "@/lib/director-store";
import { summarizePrompt } from "@/lib/prompt-builder";
import type { DirectorState } from "@/types/director";

export function GeneratedImageGrid() {
  const router = useRouter();
  const [state, setState] = useState<DirectorState | null>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => setState(loadDirectorState()), []);
  if (!state) return null;

  return (
    <div className="grid gap-8">
      <div className="grid gap-4 md:grid-cols-4">
        {state.generatedImages.map((image) => (
          <article key={`${image.variationNo}-${image.imageUrl}`} className="overflow-hidden rounded-[1.5rem] bg-white shadow-soft">
            <img src={image.imageUrl} alt={`생성 이미지 ${image.variationNo}`} className="aspect-square w-full object-cover" />
            <div className="p-4">
              <p className="text-sm font-bold text-clinic-green">Variation {image.variationNo}</p>
              <p className="mt-1 text-xs text-clinic-green/60">{image.imageCategory}</p>
            </div>
          </article>
        ))}
      </div>
      <section className="grid gap-5 rounded-[2rem] border border-clinic-green/10 bg-white p-6 shadow-soft md:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="text-sm font-bold text-clinic-orange">선택 옵션</p>
          <h2 className="mt-2 text-2xl font-black text-clinic-green">
            {state.generator.mode === "avatar" ? "의료진 아바타" : state.generator.scene || "병원 사진 장면"}
          </h2>
          <p className="mt-4 text-sm leading-7 text-clinic-green/70">
            진료과: {state.generator.department || "-"}
            <br />
            인물: {state.generator.doctorDescription || "-"}
            <br />
            공간: {state.generator.interior || "-"}
          </p>
        </div>
        <div>
          <p className="text-sm font-bold text-clinic-orange">프롬프트 요약</p>
          <p className="mt-3 text-sm leading-7 text-clinic-green/75">{summarizePrompt(state.generatedPrompt || "")}</p>
        </div>
      </section>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={() => router.push("/director/generate")}>
          다시 생성하기
        </Button>
        <Button variant="secondary" onClick={() => setSaved(true)}>
          {saved ? "저장 완료" : "결과 저장하기"}
        </Button>
        <ButtonLink href="/director/consult">실제 촬영 상담 신청하기</ButtonLink>
      </div>
    </div>
  );
}
