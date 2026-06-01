"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { loadDirectorState, saveDirectorState } from "@/lib/director-store";
import type { DirectorState, GeneratedImage } from "@/types/director";

export function GenerateClient() {
  const router = useRouter();
  const [message, setMessage] = useState("입력값을 정리하고 있습니다.");
  const [error, setError] = useState("");

  useEffect(() => {
    const state = loadDirectorState();
    const run = async () => {
      try {
        setMessage("입력한 장면을 포토클리닉 사진 톤의 프롬프트로 정리하고 있습니다.");
        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(state)
        });
        const data = (await response.json()) as {
          generatedPrompt?: string;
          generatedImages?: GeneratedImage[];
          requestId?: string;
          error?: string;
        };
        if (!response.ok) throw new Error(data.error || "이미지 생성에 실패했습니다.");
        const next: DirectorState = {
          ...state,
          requestId: data.requestId ?? state.requestId,
          generatedPrompt: data.generatedPrompt,
          generatedImages: data.generatedImages ?? []
        };
        saveDirectorState(next);
        setMessage("이미지가 준비되었습니다. 결과 페이지로 이동합니다.");
        router.replace("/director/result");
      } catch (generateError) {
        setError(generateError instanceof Error ? generateError.message : "이미지 생성에 실패했습니다.");
      }
    };
    run();
  }, [router]);

  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-8 text-center shadow-soft">
      <div className="mx-auto mb-6 size-16 animate-pulse rounded-full bg-clinic-orange/15 ring-8 ring-clinic-orange/5" />
      <h1 className="text-3xl font-black text-clinic-green">AI 이미지 생성 중</h1>
      <p className="mt-4 text-clinic-green/70">{error || message}</p>
      {error ? (
        <Button onClick={() => router.push("/director/reference")} className="mt-8">
          참고자료 다시 확인하기
        </Button>
      ) : null}
    </div>
  );
}
