import { StepHeader } from "@/components/director/StepHeader";
import { GeneratedImageGrid } from "@/components/director/GeneratedImageGrid";

export default function ResultPage() {
  return (
    <main>
      <StepHeader current={3} />
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <p className="text-sm font-bold text-clinic-orange">RESULT</p>
        <h1 className="mt-2 text-3xl font-black text-clinic-green">포토클리닉 톤으로 생성한 AI 이미지</h1>
        <div className="mt-8">
          <GeneratedImageGrid />
        </div>
      </section>
    </main>
  );
}
