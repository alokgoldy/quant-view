import { create } from "zustand";

type MarketState = {
  price: number;
  symbol: string;
  setPrice: (price: number) => void;
  setSymbol: (symbol: string) => void;
};

export const useMarketStore = create<MarketState>((set) => ({
  price: 0,
  symbol: "btcusdt",

  setPrice: (price: number) => set({ price }),
  setSymbol: (symbol: string) => set({ symbol }),
}));