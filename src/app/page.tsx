import { DealDesk } from "@/components/DealDesk";
import { PageMascot } from "@/components/PageMascot";

export default function Home() {
  return (
    <main className="mx-auto min-h-[100dvh] max-w-5xl px-4 pb-14 pt-5 md:px-6 md:pt-6">
      <header className="mb-4 border-b border-navy/10 pb-3">
        <PageMascot />
      </header>

      <div className="enter-body">
        <DealDesk />
      </div>
    </main>
  );
}
