import { useEffect } from "react";
import { createTradeSocket } from "@/services/binance";
import { useMarketStore } from "../store";
import type { BinanceTradeMessage } from "../types";

export const useMarketSocket = (): void => {
  const setPrice = useMarketStore((s) => s.setPrice);
  const symbol = useMarketStore((s) => s.symbol);

  useEffect(() => {
    const socket = createTradeSocket(symbol);

    socket.onmessage = (event: MessageEvent<string>) => {
      try {
        const data: BinanceTradeMessage = JSON.parse(event.data);
        setPrice(Number(data.p));
      } catch (error) {
        console.error("Parse error:", error);
      }
    };

    socket.onerror = (event: Event) => {
      console.error("Socket error:", event);
    };

    return () => {
      socket.close();
    };
  }, [symbol, setPrice]);
};
