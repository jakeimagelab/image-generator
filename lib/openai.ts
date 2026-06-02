export const openAIImageModel = process.env.OPENAI_IMAGE_MODEL || "dall-e-3";

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

// dall-e-3 only supports n=1, so we call in parallel for multiple images
export async function generateOpenAIImages(prompt: string, count = 4) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  const isDallE3 = openAIImageModel === "dall-e-3";

  const singleRequest = async (): Promise<OpenAIImageItem> => {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: openAIImageModel,
        prompt,
        n: 1,
        size: "1792x1024",
        quality: "hd",
        ...(isDallE3 && { style: "natural" }),
        response_format: "b64_json"
      })
    });

    const data = (await response.json()) as OpenAIImageResponse;
    if (!response.ok) {
      throw new Error(data.error?.message || "OpenAI 이미지 생성 요청에 실패했습니다.");
    }
    return data.data[0];
  };

  // Run requests in parallel
  const results = await Promise.all(Array.from({ length: count }, singleRequest));
  return results;
}
