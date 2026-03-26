export type BinanceTradeMessage = {
  e: string; // event type
  E: number; // event time
  s: string; // symbol
  t: number; // trade ID
  p: string; // price
  q: string; // quantity
};

export type MarketDirection = "up" | "down" | "flat";

export type MarketSymbol = {
  accent: string;
  baseAsset: string;
  blurb: string;
  label: string;
  quoteAsset: string;
  symbol: string;
};

export type MarketTickerSnapshot = MarketSymbol & {
  direction: MarketDirection;
  highPrice: number;
  history: number[];
  lastQuantity: number;
  lastUpdated: number | null;
  lowPrice: number;
  openPrice: number | null;
  price: number;
  tradeCount: number;
};

export type RecentTrade = {
  direction: MarketDirection;
  id: string;
  label: string;
  price: number;
  quantity: number;
  symbol: string;
  timestamp: number;
};
