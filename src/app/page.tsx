import { DealDesk } from "@/components/DealDesk";
import { PageMascot } from "@/components/PageMascot";

export default function Home() {
  return (
    <main className="mx-auto min-h-[100dvh] max-w-6xl px-5 pb-16 pt-8 md:px-8 md:pt-10">
      <header className="enter-header mb-8 flex items-end justify-between gap-6 border-b border-navy/10 pb-4">
        <div>
          <div className="mb-2 flex items-center gap-2.5">
            <h1 className="font-display text-[2.15rem] italic leading-none tracking-tight text-navy text-balance md:text-[2.4rem]">
              Mila
            </h1>
          </div>
          <p className="max-w-lg text-sm leading-relaxed text-navy/60 text-pretty">
            An AI employee for negotiating your deals.
          </p>
        </div>
        <PageMascot />
      </header>

      <div className="enter-body">
        <DealDesk />
      </div>
    </main>
  );
}
