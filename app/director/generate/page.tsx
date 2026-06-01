import { StepHeader } from "@/components/director/StepHeader";
import { GenerateClient } from "@/components/director/GenerateClient";

export default function GeneratePage() {
  return (
    <main>
      <StepHeader current={2} />
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
        <GenerateClient />
      </section>
    </main>
  );
}
