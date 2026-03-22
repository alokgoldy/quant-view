import type { FC } from "react";
import { MarketTicker } from "@/features/market/components/MarketTicker";

const App: FC = () => {
  return (
    <div className="h-screen bg-gray-900 text-white">
      <MarketTicker />
    </div>
  );
};

export default App;
