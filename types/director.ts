export const hospitalTypes = ["치과", "피부과", "성형외과", "안과", "한의원", "신경외과", "기타"] as const;

export const imageTypeOptions = [
  "원장 프로필",
  "의료진 단체사진",
  "상담 장면",
  "진료 연출 장면",
  "장비 실사용 장면",
  "병원 공간 이미지",
  "접수/응대 장면",
  "하모니컷(의료진+직원+환자)",
  "의료관광용 신뢰 이미지"
] as const;

export const moodOptions = [
  "따뜻한",
  "프리미엄한",
  "자연스러운",
  "감성적인",
  "신뢰감 있는",
  "밝고 화사한",
  "미니멀한",
  "우드톤",
  "화이트톤",
  "아이보리톤"
] as const;

export type HospitalType = (typeof hospitalTypes)[number];
export type ImageType = (typeof imageTypeOptions)[number];
export type MoodType = (typeof moodOptions)[number];

export type BasicInfo = {
  hospitalName: string;
  managerName: string;
  phone: string;
  email: string;
  websiteUrl: string;
};

export type StyleInfo = {
  hospitalType: HospitalType | "";
  imageTypes: ImageType[];
  moodTypes: MoodType[];
  spaceTone: string;
  targetPatient: string;
};

export type UploadedReference = {
  imageUrl: string;
  fileName: string;
};

export type ReferenceInfo = {
  referenceUrl: string;
  concernText: string;
  uploadedReferences: UploadedReference[];
};

export type GenerationMode = "scene" | "avatar";

export type GeneratorInput = {
  mode: GenerationMode;
  department: string;
  scene: string;
  doctorDescription: string;
  content: string;
  interior: string;
  staffPresence: string;
  patientDescription: string;
  mood: string;
  cameraStyle: string;
  usage: string;
  extraRequest: string;
};

export type GeneratedImage = {
  imageUrl: string;
  variationNo: number;
  imageCategory: string;
};

export type DirectorState = {
  leadId?: string;
  requestId?: string;
  basic: BasicInfo;
  style: StyleInfo;
  reference: ReferenceInfo;
  generator: GeneratorInput;
  generatedPrompt?: string;
  generatedImages: GeneratedImage[];
};

export type ConsultationInput = {
  desiredSchedule: string;
  budgetRange: string;
  shootingScope: string;
  note: string;
};
