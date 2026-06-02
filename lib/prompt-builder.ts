import type { BasicInfo, DirectorState, GeneratorInput, ReferenceInfo, StyleInfo } from "@/types/director";

// Photography technical terms that push models toward realism instead of AI-art style
const photoRealism = [
  "photorealistic DSLR photograph",
  "Canon EOS R5, 85mm f/1.4L lens, ISO 400",
  "natural window light with subtle fill, slight lens flare",
  "shallow depth of field, bokeh background",
  "film grain texture, slight chromatic aberration at edges",
  "real photograph — not CGI, not illustration, not AI art",
  "slight motion blur on non-subject elements",
  "authentic skin texture with natural pores, no smoothing filter",
  "high-end commercial editorial photography",
  "shot in RAW, developed in Lightroom with warm color grade"
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

export function getGenerationCategory(state: Pick<DirectorState, "generator" | "style">) {
  if (state.generator?.mode === "avatar") return "포토클리닉 의료진 아바타";
  return state.generator?.scene || state.style.imageTypes[0] || "포토클리닉 병원 사진";
}

export function summarizePrompt(prompt: string) {
  return prompt.length > 220 ? `${prompt.slice(0, 220)}...` : prompt;
}
