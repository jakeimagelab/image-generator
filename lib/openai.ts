export const openAIImageModel = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1.5";

type OpenAIImageItem = {
  b64_json?: string;
  url?: string;
};

type OpenAIImageResponse = {
  data: OpenAIImageItem[];
  error?: {
    message?: string;
  };
};

export async function generateOpenAIImages(prompt: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: openAIImageModel,
      prompt,
      n: 4,
      size: "1024x1024"
    })
  });

  const data = (await response.json()) as OpenAIImageResponse;
  if (!response.ok) {
    throw new Error(data.error?.message || "OpenAI 이미지 생성 요청에 실패했습니다.");
  }

  return data.data;
}
