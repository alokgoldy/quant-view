import type { FC } from "react";
import { MarketTicker } from "@/features/market/components/MarketTicker";

const App: FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-8%] h-80 w-80 rounded-full bg-[rgba(245,158,11,0.16)] blur-3xl" />
        <div className="absolute right-[-8%] top-[12%] h-96 w-96 rounded-full bg-[rgba(56,189,248,0.14)] blur-3xl" />
        <div className="absolute bottom-[-14%] left-[28%] h-96 w-96 rounded-full bg-[rgba(45,212,191,0.12)] blur-3xl" />
      </div>

      <main className="relative mx-auto min-h-screen max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <MarketTicker />
      </main>
    </div>
  );
};

export default App;
