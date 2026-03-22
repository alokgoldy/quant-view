export type BinanceTradeMessage = {
  e: string; // event type
  E: number; // event time
  s: string; // symbol
  t: number; // trade ID
  p: string; // price
  q: string; // quantity
};