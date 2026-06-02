const FLUX_DEV_MODEL = "black-forest-labs/flux-dev";

type ReplicatePrediction = {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: string[];
  error?: string;
};

async function createPrediction(prompt: string): Promise<ReplicatePrediction> {
  const response = await fetch(`https://api.replicate.com/v1/models/${FLUX_DEV_MODEL}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
      Prefer: "wait" // 동기 응답 — 최대 60초 대기
    },
    body: JSON.stringify({
      input: {
        prompt,
        num_outputs: 1,
        aspect_ratio: "16:9",       // 병원 이미지에 적합한 가로형
        output_format: "jpg",
        output_quality: 92,
        num_inference_steps: 40,    // 높을수록 디테일 ↑ (max 50)
        guidance: 3.5               // 프롬프트 충실도
      }
    })
  });

  const data = (await response.json()) as ReplicatePrediction;

  if (!response.ok) {
    throw new Error((data as { detail?: string }).detail ?? "Replicate 요청에 실패했습니다.");
  }

  return data;
}

async function pollPrediction(id: string): Promise<string[]> {
  const maxAttempts = 30;
  const interval = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}` }
    });
    const data = (await response.json()) as ReplicatePrediction;

    if (data.status === "succeeded" && data.output?.length) {
      return data.output;
    }
    if (data.status === "failed" || data.status === "canceled") {
      throw new Error(data.error ?? "Flux 이미지 생성에 실패했습니다.");
    }

    await new Promise((r) => setTimeout(r, interval));
  }

  throw new Error("Flux 이미지 생성 시간 초과.");
}

export async function generateFluxImages(prompt: string, count = 4): Promise<string[]> {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN이 설정되지 않았습니다.");
  }

  // count만큼 병렬 생성
  const predictions = await Promise.all(
    Array.from({ length: count }, () => createPrediction(prompt))
  );

  // Prefer: wait 로 이미 완료된 경우 바로 반환, 아니면 폴링
  const urls = await Promise.all(
    predictions.map(async (pred) => {
      if (pred.status === "succeeded" && pred.output?.length) {
        return pred.output[0];
      }
      const output = await pollPrediction(pred.id);
      return output[0];
    })
  );

  return urls;
}
