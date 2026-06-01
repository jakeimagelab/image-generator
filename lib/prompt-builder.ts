import type { BasicInfo, DirectorState, GeneratorInput, ReferenceInfo, StyleInfo } from "@/types/director";

const styleRules = [
  "병원 공간과 사람의 조화",
  "따뜻하고 자연스러운 분위기",
  "과하지 않은 감성",
  "신뢰감과 전문성",
  "화사하지만 부담스럽지 않은 조명",
  "실제 병원 홍보용으로 적합한 구성",
  "의료진, 공간, 환자 관계성이 잘 드러나는 장면",
  "깨끗하고 프리미엄한 병원 브랜딩 이미지"
];

const peopleByImageType: Record<string, string> = {
  "원장 프로필": "원장 또는 대표 의료진이 중심이 되는 인물 구성",
  "의료진 단체사진": "의료진과 직원이 안정감 있게 함께 서 있는 구성",
  "상담 장면": "의료진이 환자에게 차분하게 설명하는 관계 중심 구성",
  "진료 연출 장면": "의료진과 환자가 자연스럽게 상호작용하는 진료 구성",
  "장비 실사용 장면": "의료진이 장비를 전문적으로 다루는 실제 사용 구성",
  "병원 공간 이미지": "공간의 동선과 브랜드 무드가 잘 보이는 구성",
  "접수/응대 장면": "직원과 내원객의 친절한 응대가 보이는 구성",
  "하모니컷(의료진+직원+환자)": "의료진, 직원, 환자의 관계성이 조화롭게 드러나는 구성",
  "의료관광용 신뢰 이미지": "해외 환자도 신뢰할 수 있는 전문적이고 환대감 있는 구성"
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
    `${hospitalName}${style.hospitalType || "병원"} 브랜딩 이미지 컨셉.`,
    `${primaryScene}을 중심으로 ${imageTypes.join(", ")} 목적에 활용할 수 있는 장면.`,
    people,
    `${spaceTone} 공간, ${moods} 무드, ${targetPatient}.`,
    styleRules.join(", ") + ".",
    concern,
    urlHint,
    "홈페이지 메인, 소개 페이지, 네이버 플레이스, SNS 홍보에 적합한 고급스럽고 현실적인 포토클리닉 스타일 병원 브랜딩 이미지.",
    "사진처럼 사실적이고, 과장된 의료 표현이나 비현실적인 시술 장면은 피한다."
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildDetailedGenerationPrompt(input: GeneratorInput) {
  const isAvatar = input.mode === "avatar";
  const subject = isAvatar ? "병원 브랜딩용 의료진 아바타/프로필 이미지" : "병원 홍보용 실제 촬영 스타일 이미지";
  const avatarRule = isAvatar
    ? "상반신 또는 반신 중심, 깨끗한 배경, 전문적이지만 딱딱하지 않은 표정, 과장된 캐릭터가 아닌 사실적인 AI 아바타."
    : "실제 병원 현장에서 촬영한 듯한 자연스러운 장면, 사람과 공간의 관계가 분명한 사진.";

  return [
    `${input.department || "병원"} ${subject}.`,
    input.scene ? `장면: ${input.scene}.` : "",
    input.doctorDescription ? `원장/주요 인물: ${input.doctorDescription}.` : "",
    input.content ? `핵심 내용: ${input.content}.` : "",
    input.interior ? `인테리어와 공간톤: ${input.interior}.` : "",
    input.staffPresence ? `직원 유무와 구성: ${input.staffPresence}.` : "",
    input.patientDescription ? `환자 또는 함께 등장하는 인물: ${input.patientDescription}.` : "",
    input.mood ? `전체 분위기: ${input.mood}.` : "",
    input.cameraStyle ? `카메라/사진 스타일: ${input.cameraStyle}.` : "",
    input.usage ? `활용 목적: ${input.usage}.` : "",
    avatarRule,
    styleRules.join(", ") + ".",
    "포토클리닉 특유의 따뜻하고 프리미엄한 병원 브랜딩 사진 톤, 화이트와 아이보리 기반의 정돈된 색감, 부담스럽지 않은 화사한 조명.",
    "의료 광고로 활용 가능한 깨끗하고 신뢰감 있는 표현. 과장된 시술 효과, 피, 상처, 불쾌한 의료 묘사는 피한다.",
    input.extraRequest ? `추가 요청: ${input.extraRequest}.` : ""
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
