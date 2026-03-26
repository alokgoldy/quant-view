import { useEffect } from "react";
import { createTradeSocket } from "@/services/binance";
import { useMarketStore } from "../store";
import type { BinanceTradeMessage } from "../types";

export const useMarketSocket = (symbols: string[]): void => {
  const ingestTrade = useMarketStore((state) => state.ingestTrade);

  useEffect(() => {
    const sockets = symbols.map((symbol) => {
      const socket = createTradeSocket(symbol);

      socket.onmessage = (event: MessageEvent<string>) => {
        try {
          const data: BinanceTradeMessage = JSON.parse(event.data);
          ingestTrade({
            eventTime: data.E,
            price: Number(data.p),
            quantity: Number(data.q),
            symbol: data.s.toLowerCase(),
          });
        } catch (error) {
          console.error("Parse error:", error);
        }
      };

      socket.onerror = (event: Event) => {
        console.error("Socket error:", event);
      };

      return socket;
    });

    return () => {
      sockets.forEach((socket) => socket.close());
    };
  }, [symbols, ingestTrade]);
};
