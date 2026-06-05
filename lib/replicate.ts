const FLUX_DEV_MODEL    = "black-forest-labs/flux-dev";
const FLUX_REDUX_MODEL  = "black-forest-labs/flux-redux-dev";

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
      Prefer: "wait"
    },
    body: JSON.stringify({
      input: {
        prompt,
        num_outputs: 1,
        aspect_ratio: "16:9",
        output_format: "jpg",
        output_quality: 92,
        num_inference_steps: 40,
        guidance: 3.5
      }
    })
  });

  const data = (await response.json()) as ReplicatePrediction;
  if (!response.ok) {
    throw new Error((data as { detail?: string }).detail ?? "Replicate 요청에 실패했습니다.");
  }
  return data;
}

// ── Flux Redux: 이미지 → 베리에이션 ────────────────────────
async function createReduxPrediction(
  imageUrl: string
): Promise<ReplicatePrediction> {
  const response = await fetch(`https://api.replicate.com/v1/models/${FLUX_REDUX_MODEL}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
      Prefer: "wait"
    },
    body: JSON.stringify({
      input: {
        redux_image: imageUrl,
        num_outputs: 1,
        aspect_ratio: "3:2",
        output_format: "jpg",
        output_quality: 95,
        num_inference_steps: 50,
        guidance: 3.5,
        megapixels: "1"
      }
    })
  });

  const data = (await response.json()) as ReplicatePrediction;
  if (!response.ok) {
    throw new Error((data as { detail?: string }).detail ?? "Redux 요청에 실패했습니다.");
  }
  return data;
}

// ── Flux Dev img2img: 이미지 + 프롬프트 → 베리에이션 ─────
async function createImg2ImgPrediction(
  imageDataUrl: string,
  prompt: string,
  strength: number
): Promise<ReplicatePrediction> {
  const response = await fetch(`https://api.replicate.com/v1/models/${FLUX_DEV_MODEL}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
      Prefer: "wait"
    },
    body: JSON.stringify({
      input: {
        prompt,
        image: imageDataUrl,
        strength,         // 0.0 = 원본 그대로, 1.0 = 완전히 새로 생성
        num_outputs: 1,
        aspect_ratio: "3:2",
        output_format: "jpg",
        output_quality: 95,
        num_inference_steps: 50,
        guidance: 3.5
      }
    })
  });

  const data = (await response.json()) as ReplicatePrediction;
  if (!response.ok) {
    throw new Error((data as { detail?: string }).detail ?? "img2img 요청에 실패했습니다.");
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

    if (data.status === "succeeded" && data.output?.length) return data.output;
    if (data.status === "failed" || data.status === "canceled") {
      throw new Error(data.error ?? "이미지 생성에 실패했습니다.");
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error("이미지 생성 시간 초과.");
}

export async function generateFluxImages(prompt: string, count = 4): Promise<string[]> {
  if (!process.env.REPLICATE_API_TOKEN) throw new Error("REPLICATE_API_TOKEN이 설정되지 않았습니다.");
  const predictions = await Promise.all(Array.from({ length: count }, () => createPrediction(prompt)));
  const urls = await Promise.all(
    predictions.map(async (pred) => {
      if (pred.status === "succeeded" && pred.output?.length) return pred.output[0];
      const output = await pollPrediction(pred.id);
      return output[0];
    })
  );
  return urls;
}

// ── 베리에이션 생성 (Redux 방식 — 원본 이미지 기반) ────────
export async function generateFluxVariations(
  imageUrl: string,
  count = 4
): Promise<string[]> {
  if (!process.env.REPLICATE_API_TOKEN) throw new Error("REPLICATE_API_TOKEN이 설정되지 않았습니다.");

  const predictions = await Promise.all(
    Array.from({ length: count }, () => createReduxPrediction(imageUrl))
  );
  const urls = await Promise.all(
    predictions.map(async (pred) => {
      if (pred.status === "succeeded" && pred.output?.length) return pred.output[0];
      const output = await pollPrediction(pred.id);
      return output[0];
    })
  );
  return urls;
}

// ── img2img 베리에이션 (프롬프트 + 강도 조절) ────────────
export async function generateImg2ImgVariations(
  imageDataUrl: string,
  prompt: string,
  strength: number,
  count = 4
): Promise<string[]> {
  if (!process.env.REPLICATE_API_TOKEN) throw new Error("REPLICATE_API_TOKEN이 설정되지 않았습니다.");

  const predictions = await Promise.all(
    Array.from({ length: count }, () => createImg2ImgPrediction(imageDataUrl, prompt, strength))
  );
  const urls = await Promise.all(
    predictions.map(async (pred) => {
      if (pred.status === "succeeded" && pred.output?.length) return pred.output[0];
      const output = await pollPrediction(pred.id);
      return output[0];
    })
  );
  return urls;
}
