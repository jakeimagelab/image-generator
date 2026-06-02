import type { BasicInfo, DirectorState, GeneratorInput, ReferenceInfo, StyleInfo } from "@/types/director";

// Photography technical terms that push models toward realism instead of AI-art style
const photoRealism = [
  "photorealistic DSLR photograph, indistinguishable from a real photo",
  "Canon EOS R5, 85mm f/1.4L lens, ISO 320, aperture priority",
  "soft natural side window light, gentle shadow on opposite side",
  "extremely shallow depth of field — subject razor sharp, background creamy bokeh",
  "authentic Korean skin texture with natural pores, no beauty filter, no skin smoothing",
  "real photograph — not CGI, not digital illustration, not AI-generated art",
  "warm ivory and beige color grade, slight warm tone in highlights",
  "high-end Korean medical clinic editorial photography",
  "shot in RAW, color graded in Lightroom — creamy, desaturated, film-like",
  "subtle film grain, natural chromatic aberration at edges"
];

const styleRules = [
  "harmonious blend of medical space and people",
  "warm and natural atmosphere",
  "subtle and understated emotion",
  "trustworthy and professional feel",
  "bright but not harsh lighting",
  "suitable for real hospital branding",
  "clear relationship between staff, space, and patients",
  "clean premium hospital brand image"
];

const peopleByImageType: Record<string, string> = {
  "원장 프로필": "lead doctor as the central subject, confident and approachable expression",
  "의료진 단체사진": "medical staff and employees standing together in a calm, unified composition",
  "상담 장면": "doctor calmly explaining to a patient, relationship-focused composition",
  "진료 연출 장면": "doctor and patient naturally interacting during a consultation",
  "장비 실사용 장면": "medical professional expertly handling equipment in actual use",
  "병원 공간 이미지": "hospital interior with clear flow and brand mood visible",
  "접수/응대 장면": "friendly staff greeting a visitor at the reception desk",
  "하모니컷(의료진+직원+환자)": "harmonious scene showing doctors, staff, and patient relationship",
  "의료관광용 신뢰 이미지": "professional and welcoming scene that builds trust with international patients"
};

export function buildPhotoclinicPrompt({
  basic,
  style,
  reference,
  generator
}: {
  basic: BasicInfo;
  style: StyleInfo;
  reference: ReferenceInfo;
  generator?: GeneratorInput;
}) {
  if (generator && (generator.scene || generator.content || generator.doctorDescription)) {
    return buildDetailedGenerationPrompt(generator);
  }

  const imageTypes = style.imageTypes.length ? style.imageTypes : ["병원 공간 이미지"];
  const moods = style.moodTypes.length ? style.moodTypes.join(", ") : "따뜻한, 신뢰감 있는";
  const primaryScene = imageTypes[0];
  const people = imageTypes.map((type) => peopleByImageType[type] ?? "의료진과 환자가 자연스럽게 보이는 구성").join(", ");
  const spaceTone = style.spaceTone || style.moodTypes.find((mood) => mood.includes("톤")) || "아이보리와 화이트 기반의 깨끗한 공간톤";
  const targetPatient = style.targetPatient ? `${style.targetPatient}에게 신뢰감을 주는 방향` : "초진 환자와 재방문 환자 모두에게 신뢰감을 주는 방향";
  const concern = reference.concernText ? `현재 고민은 "${reference.concernText}"이며, 이를 개선하는 장면으로 제안한다.` : "";
  const urlHint = reference.referenceUrl ? `참고 URL의 브랜드 톤을 과하게 모사하지 않고 방향성만 참고한다: ${reference.referenceUrl}.` : "";
  const hospitalName = basic.hospitalName ? `${basic.hospitalName}의 ` : "";

  return [
    `Real photograph for ${hospitalName}${style.hospitalType || "medical clinic"} branding.`,
    `Primary scene: ${primaryScene}. Usable for: ${imageTypes.join(", ")}.`,
    people,
    `Space tone: ${spaceTone}. Mood: ${moods}. Target: ${targetPatient}.`,
    styleRules.join(", ") + ".",
    photoRealism.join(", ") + ".",
    concern,
    urlHint,
    "Premium hospital branding photograph suitable for website homepage, about page, Naver Place, and SNS. Clean, tasteful, and professional medical imagery appropriate for all audiences."
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildDetailedGenerationPrompt(input: GeneratorInput) {
  const isAvatar = input.mode === "avatar";
  const subject = isAvatar
    ? "medical staff avatar / profile photo for hospital branding"
    : "real-photo-style image for hospital promotion";
  const avatarRule = isAvatar
    ? "Upper-body or half-body portrait, clean background, professional yet approachable expression, realistic style — not a cartoon or exaggerated character."
    : "Natural scene as if photographed on-site in a real hospital, clear relationship between people and space.";

  return [
    `${input.department || "Medical clinic"} — ${subject}.`,
    input.scene ? `Scene: ${input.scene}.` : "",
    input.doctorDescription ? `Lead doctor / key subject: ${input.doctorDescription}.` : "",
    input.content ? `Key content: ${input.content}.` : "",
    input.interior ? `Interior and space tone: ${input.interior}.` : "",
    input.staffPresence ? `Staff presence and composition: ${input.staffPresence}.` : "",
    input.patientDescription ? `Patient or accompanying person: ${input.patientDescription}.` : "",
    input.mood ? `Overall mood: ${input.mood}.` : "",
    input.cameraStyle ? `Camera / photo style: ${input.cameraStyle}.` : "",
    input.usage ? `Intended use: ${input.usage}.` : "",
    avatarRule,
    styleRules.join(", ") + ".",
    photoRealism.join(", ") + ".",
    "Warm and premium hospital branding photo tone. White and ivory base palette, tidy and bright lighting. Clean and trustworthy medical advertising image appropriate for all audiences. Comfortable and welcoming hospital environment.",
    input.extraRequest ? `Additional request: ${input.extraRequest}.` : ""
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Flux Dev 전용 프롬프트 빌더
 * Flux는 키워드 나열보다 자연스러운 문장 묘사가 훨씬 효과적
 */
export function buildFluxPrompt({
  basic,
  style,
  reference,
  generator
}: {
  basic: BasicInfo;
  style: StyleInfo;
  reference: ReferenceInfo;
  generator?: GeneratorInput;
}): string {
  const hospitalName = basic.hospitalName || "a premium medical clinic";
  const hospitalType = style.hospitalType || "dermatology clinic";
  const department = generator?.department || "dermatology";

  // 장면 묘사를 자연스러운 문장으로 변환
  const sceneDesc = generator?.scene
    ? generator.scene
    : style.imageTypes[0] === "상담 장면"
      ? "a doctor calmly consulting with a patient"
      : style.imageTypes[0] === "원장 프로필"
        ? "a lead doctor posing professionally in the clinic"
        : "the interior of an upscale medical clinic";

  const doctorDesc = generator?.doctorDescription
    ? generator.doctorDescription
    : "a Korean female doctor in her early 30s, wearing a clean white coat, natural makeup, hair neatly tied back";

  const interiorDesc = generator?.interior
    || style.spaceTone
    || "a minimalist consultation room with ivory and beige tones, warm ambient lighting, clean modern furniture";

  const moodDesc = generator?.mood
    || (style.moodTypes.length ? style.moodTypes.join(", ") : "warm, trustworthy, and professional");

  const cameraDesc = generator?.cameraStyle
    || "Canon EOS R5, 85mm f/1.4L lens at ISO 320, soft natural side window light, extremely shallow depth of field with creamy bokeh background";

  const extraDesc = generator?.extraRequest || reference.concernText || "";

  return [
    `A photorealistic DSLR photograph of ${sceneDesc} at ${hospitalName}, a ${department} ${hospitalType}.`,
    `Subject: ${doctorDesc}.`,
    `The setting is ${interiorDesc}.`,
    `Mood: ${moodDesc}.`,
    `Shot with ${cameraDesc}.`,
    `The subject is in sharp focus while the background melts into soft bokeh.`,
    `Authentic skin texture with natural pores visible, no beauty filter or skin smoothing.`,
    `Warm ivory and beige color grade, slight warm tone in highlights, subtle film grain.`,
    `High-end Korean medical clinic editorial photography style. Real photograph, not CGI or illustration.`,
    extraDesc ? `Additional detail: ${extraDesc}.` : ""
  ]
    .filter(Boolean)
    .join(" ");
}

export function getGenerationCategory(state: Pick<DirectorState, "generator" | "style">) {
  if (state.generator?.mode === "avatar") return "포토클리닉 의료진 아바타";
  return state.generator?.scene || state.style.imageTypes[0] || "포토클리닉 병원 사진";
}

export function summarizePrompt(prompt: string) {
  return prompt.length > 220 ? `${prompt.slice(0, 220)}...` : prompt;
}
