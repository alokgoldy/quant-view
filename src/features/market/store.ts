import { create } from "zustand";
import { MARKET_SYMBOLS } from "./data";
import type {
  MarketDirection,
  MarketTickerSnapshot,
  RecentTrade,
} from "./types";

type MarketState = {
  recentTrades: RecentTrade[];
  selectedSymbol: string;
  tickers: Record<string, MarketTickerSnapshot>;
  ingestTrade: (payload: {
    eventTime: number;
    price: number;
    quantity: number;
    symbol: string;
  }) => void;
  setSelectedSymbol: (symbol: string) => void;
};

const createInitialTicker = (market: (typeof MARKET_SYMBOLS)[number]): MarketTickerSnapshot => ({
  accent: market.accent,
  baseAsset: market.baseAsset,
  blurb: market.blurb,
  direction: "flat",
  highPrice: 0,
  history: [],
  label: market.label,
  lastQuantity: 0,
  lastUpdated: null,
  lowPrice: 0,
  openPrice: null,
  price: 0,
  quoteAsset: market.quoteAsset,
  symbol: market.symbol,
  tradeCount: 0,
});

const initialTickers = MARKET_SYMBOLS.reduce<Record<string, MarketTickerSnapshot>>(
  (result, market) => {
    result[market.symbol] = createInitialTicker(market);
    return result;
  },
  {},
);

export const useMarketStore = create<MarketState>((set) => ({
  recentTrades: [],
  selectedSymbol: MARKET_SYMBOLS[0]?.symbol ?? "btcusdt",
  tickers: initialTickers,

  ingestTrade: ({ eventTime, price, quantity, symbol }) =>
    set((state) => {
      const currentTicker = state.tickers[symbol];

      if (!currentTicker) {
        return state;
      }

      const direction: MarketDirection =
        currentTicker.price === 0
          ? "flat"
          : price > currentTicker.price
            ? "up"
            : price < currentTicker.price
              ? "down"
              : currentTicker.direction;

      const nextTicker: MarketTickerSnapshot = {
        ...currentTicker,
        direction,
        highPrice: currentTicker.highPrice ? Math.max(currentTicker.highPrice, price) : price,
        history: [...currentTicker.history, price].slice(-18),
        lastQuantity: quantity,
        lastUpdated: eventTime,
        lowPrice: currentTicker.lowPrice ? Math.min(currentTicker.lowPrice, price) : price,
        openPrice: currentTicker.openPrice ?? price,
        price,
        tradeCount: currentTicker.tradeCount + 1,
      };

      return {
        recentTrades: [
          {
            direction,
            id: `${symbol}-${eventTime}-${nextTicker.tradeCount}`,
            label: currentTicker.label,
            price,
            quantity,
            symbol,
            timestamp: eventTime,
          },
          ...state.recentTrades,
        ].slice(0, 12),
        tickers: {
          ...state.tickers,
          [symbol]: nextTicker,
        },
      };
    }),
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
}));
