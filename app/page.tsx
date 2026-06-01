import { ButtonLink } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-12 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <p className="mb-5 text-sm font-black tracking-[0.24em] text-clinic-orange">PHOTOCLINIC AI IMAGE DIRECTOR</p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-clinic-green sm:text-6xl">포토클리닉 사진 느낌을 AI로 바로 생성하세요</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-clinic-green/75">
            상담 장면, 시술 장면, 원장 프로필, 의료진 아바타까지 원하는 장면을 세세하게 입력하면 포토클리닉 스타일의 병원 이미지를 생성합니다.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/director/start">AI 이미지 생성하기</ButtonLink>
            <ButtonLink href="/director/start" variant="outline">아바타 만들기</ButtonLink>
          </div>
        </div>
        <div className="rounded-[2rem] border border-clinic-green/10 bg-white p-4 shadow-soft">
          <div className="rounded-[1.5rem] bg-clinic-ivory p-5">
            <div className="aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-[linear-gradient(145deg,#fff,#efe5d6)] p-5">
              <div className="flex h-full flex-col justify-between rounded-[1rem] border border-white/80 bg-white/65 p-5">
                <div>
                  <p className="text-xs font-bold tracking-[0.18em] text-clinic-orange">PROMPT BUILDER</p>
                  <h2 className="mt-3 text-2xl font-black text-clinic-green">피부과 원장님 시술 장면</h2>
                  <p className="mt-4 text-sm leading-7 text-clinic-green/70">
                    아담한 키의 한국인 여성 원장, 필러 주사 시술, 따뜻한 아이보리 공간, 1명 간호사 동행.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {["진료과", "장면", "원장", "인테리어"].map((item) => (
                    <div key={item} className="rounded-2xl bg-white px-4 py-5 text-sm font-bold text-clinic-green shadow-sm">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
