import { StepHeader } from "@/components/director/StepHeader";
import { ConsultationForm } from "@/components/director/ConsultationForm";

export default function ConsultPage() {
  return (
    <main>
      <StepHeader current={4} />
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <p className="text-sm font-bold text-clinic-orange">CONSULT</p>
        <h1 className="mt-2 text-3xl font-black text-clinic-green">실제 촬영 상담 신청</h1>
        <p className="mt-4 max-w-2xl text-clinic-green/70">
          AI 결과를 바탕으로 촬영 범위와 무드를 정리해 상담으로 연결합니다.
        </p>
        <div className="mt-8 rounded-[2rem] bg-white p-6 shadow-soft sm:p-8">
          <ConsultationForm />
        </div>
      </section>
    </main>
  );
}
