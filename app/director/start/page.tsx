import { StepHeader } from "@/components/director/StepHeader";
import { BasicInfoForm } from "@/components/director/BasicInfoForm";

export default function StartPage() {
  return (
    <main>
      <StepHeader current={1} />
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <p className="text-sm font-bold text-clinic-orange">PHOTOCLINIC GENERATOR</p>
        <h1 className="mt-2 text-3xl font-black text-clinic-green">원하는 병원 사진 장면을 자세히 입력해주세요</h1>
        <p className="mt-4 max-w-3xl text-clinic-green/70">
          상담, 시술, 원장 프로필, 의료진 아바타까지 포토클리닉의 따뜻하고 프리미엄한 사진 톤으로 생성합니다.
        </p>
        <div className="mt-8 rounded-[2rem] bg-white p-6 shadow-soft sm:p-8">
          <BasicInfoForm />
        </div>
      </section>
    </main>
  );
}
