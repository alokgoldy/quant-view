import type { FC } from "react";
import { useMarketStore } from "../store";
import { useMarketSocket } from "../hooks/useMarketSocket";

export const MarketTicker: FC = () => {
  const price = useMarketStore((s) => s.price);

  useMarketSocket();

  return (
    <div className="p-4 bg-black text-green-400 text-xl font-semibold">
      BTC/USDT: {price ? price.toFixed(2) : "Loading..."}
    </div>
  );
};