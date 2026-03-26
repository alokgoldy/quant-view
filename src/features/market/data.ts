import type { MarketSymbol } from "./types";

export const MARKET_SYMBOLS: MarketSymbol[] = [
  {
    symbol: "btcusdt",
    label: "BTC / USDT",
    baseAsset: "Bitcoin",
    quoteAsset: "Tether",
    accent: "#f59e0b",
    blurb: "Institutional bellwether with the deepest tape.",
  },
  {
    symbol: "ethusdt",
    label: "ETH / USDT",
    baseAsset: "Ethereum",
    quoteAsset: "Tether",
    accent: "#38bdf8",
    blurb: "Execution layer leader with persistent flow.",
  },
  {
    symbol: "solusdt",
    label: "SOL / USDT",
    baseAsset: "Solana",
    quoteAsset: "Tether",
    accent: "#2dd4bf",
    blurb: "Fast beta proxy with sharp intraday rotations.",
  },
  {
    symbol: "bnbusdt",
    label: "BNB / USDT",
    baseAsset: "BNB",
    quoteAsset: "Tether",
    accent: "#fb7185",
    blurb: "Exchange-linked risk barometer for the basket.",
  },
];
