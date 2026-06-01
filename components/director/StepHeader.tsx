import Link from "next/link";
import { cn } from "@/lib/utils";

const steps = [
  { label: "프롬프트 입력", href: "/director/start" },
  { label: "생성", href: "/director/generate" },
  { label: "결과", href: "/director/result" },
  { label: "상담", href: "/director/consult" }
];

export function StepHeader({ current }: { current: number }) {
  return (
    <header className="mx-auto w-full max-w-5xl px-5 pt-6 sm:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link href="/" className="text-lg font-black tracking-[0.08em] text-clinic-green">
          PHOTOCLINIC
        </Link>
        <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-clinic-green/70 shadow-sm">
          AI 이미지 디렉터
        </span>
      </div>
      <nav aria-label="진행 단계" className="overflow-x-auto pb-2">
        <ol className="flex min-w-max gap-2">
          {steps.map((step, index) => {
            const active = index + 1 <= current;
            return (
              <li key={step.href} className="flex items-center gap-2">
                <Link
                  href={step.href}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition",
                    active ? "bg-clinic-green text-white" : "bg-white text-clinic-green/55"
                  )}
                >
                  <span>{index + 1}</span>
                  <span>{step.label}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </header>
  );
}
