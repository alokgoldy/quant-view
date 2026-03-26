import { useEffect, useState, type CSSProperties, type FC } from "react";
import { MARKET_SYMBOLS } from "../data";
import { useMarketSocket } from "../hooks/useMarketSocket";
import { useMarketStore } from "../store";
import type { MarketDirection, MarketTickerSnapshot, RecentTrade } from "../types";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const formatPrice = (price: number): string => {
  if (!price) {
    return "Loading";
  }

  if (price >= 1000) {
    return numberFormatter.format(price);
  }

  if (price >= 1) {
    return price.toFixed(3);
  }

  return price.toFixed(5);
};

const formatPercent = (value: number): string => {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
};

const formatQuantity = (value: number): string => {
  if (!value) {
    return "0.00";
  }

  if (value >= 1000) {
    return compactFormatter.format(value);
  }

  if (value >= 1) {
    return value.toFixed(2);
  }

  return value.toFixed(4);
};

const formatRange = (ticker: MarketTickerSnapshot): string => {
  if (!ticker.highPrice || !ticker.lowPrice) {
    return "Waiting for trades";
  }

  return `${formatPrice(ticker.lowPrice)} - ${formatPrice(ticker.highPrice)}`;
};

const getSessionChange = (ticker: MarketTickerSnapshot): number => {
  if (!ticker.openPrice || !ticker.price) {
    return 0;
  }

  return ((ticker.price - ticker.openPrice) / ticker.openPrice) * 100;
};

const getRangeFill = (ticker: MarketTickerSnapshot): number => {
  if (!ticker.price || ticker.highPrice === ticker.lowPrice) {
    return 50;
  }

  return ((ticker.price - ticker.lowPrice) / (ticker.highPrice - ticker.lowPrice)) * 100;
};

const getDirectionTone = (direction: MarketDirection): string => {
  if (direction === "up") {
    return "text-emerald-300";
  }

  if (direction === "down") {
    return "text-rose-300";
  }

  return "text-stone-300";
};

const getSparkBars = (history: number[]): number[] => {
  if (history.length <= 1) {
    return [48, 52, 50, 54, 49, 56, 52, 58, 54, 60];
  }

  const min = Math.min(...history);
  const max = Math.max(...history);
  const spread = max - min || 1;

  return history.map((value) => 24 + ((value - min) / spread) * 76);
};

const hexToRgba = (hex: string, alpha: number): string => {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const panelClassName =
  "rounded-[2rem] border border-white/10 bg-[rgba(10,14,20,0.76)] shadow-[0_24px_80px_rgba(3,8,16,0.55)] backdrop-blur-xl";
const socketSymbols = MARKET_SYMBOLS.map((market) => market.symbol);

const MarketCard = ({
  isSelected,
  onSelect,
  ticker,
  now,
}: {
  isSelected: boolean;
  onSelect: () => void;
  ticker: MarketTickerSnapshot;
  now: number;
}) => {
  const accent = ticker.accent;
  const change = getSessionChange(ticker);
  const bars = getSparkBars(ticker.history);
  const live = ticker.lastUpdated ? now - ticker.lastUpdated < 3_000 : false;

  const style = {
    background: `linear-gradient(160deg, ${hexToRgba(accent, 0.22)} 0%, rgba(9, 12, 18, 0.96) 55%, rgba(9, 12, 18, 0.88) 100%)`,
    borderColor: isSelected ? hexToRgba(accent, 0.8) : "rgba(255,255,255,0.1)",
    boxShadow: isSelected
      ? `0 28px 60px ${hexToRgba(accent, 0.22)}`
      : "0 20px 44px rgba(3, 8, 16, 0.28)",
  } satisfies CSSProperties;

  return (
    <button
      className="group relative overflow-hidden rounded-[1.75rem] border p-5 text-left transition duration-300 hover:-translate-y-1"
      onClick={onSelect}
      style={style}
      type="button"
    >
      <div
        className="absolute right-[-4rem] top-[-5rem] h-32 w-32 rounded-full blur-3xl"
        style={{ backgroundColor: hexToRgba(accent, 0.28) }}
      />

      <div className="relative space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-stone-300/80">
              {ticker.baseAsset}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[0.04em] text-stone-50">
              {ticker.label}
            </h2>
          </div>

          <div
            className={`rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] ${
              live ? "bg-emerald-400/16 text-emerald-200" : "bg-stone-400/12 text-stone-200"
            }`}
          >
            {live ? "Live" : "Syncing"}
          </div>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="font-data text-4xl font-semibold tracking-tight text-stone-50">
              {formatPrice(ticker.price)}
            </div>
            <div className={`mt-2 text-sm font-medium ${getDirectionTone(ticker.direction)}`}>
              Session {formatPercent(change)}
            </div>
          </div>

          <div className="text-right text-xs uppercase tracking-[0.2em] text-stone-300/80">
            <div>Trades</div>
            <div className="mt-2 font-data text-lg tracking-normal text-stone-100">
              {compactFormatter.format(ticker.tradeCount)}
            </div>
          </div>
        </div>

        <div className="flex h-16 items-end gap-1">
          {bars.map((height, index) => (
            <div
              className="flex-1 rounded-full transition-all duration-300 group-hover:opacity-100"
              key={`${ticker.symbol}-${index}`}
              style={{
                height: `${height}%`,
                background: `linear-gradient(180deg, ${hexToRgba(accent, 0.92)} 0%, ${hexToRgba(accent, 0.14)} 100%)`,
                opacity: 0.86,
              }}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-stone-200/86">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-stone-400">Range</p>
            <p className="mt-1 font-data">{formatRange(ticker)}</p>
          </div>
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-stone-400">Last Size</p>
            <p className="mt-1 font-data">{formatQuantity(ticker.lastQuantity)}</p>
          </div>
        </div>
      </div>
    </button>
  );
};

const TapeRow = ({ trade }: { trade: RecentTrade }) => {
  const directionClass = getDirectionTone(trade.direction);

  return (
    <div className="grid grid-cols-[1.2fr_1fr_0.9fr] items-center gap-3 rounded-2xl border border-white/6 bg-white/4 px-4 py-3 text-sm">
      <div>
        <div className="font-medium tracking-[0.08em] text-stone-100">{trade.label}</div>
        <div className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-400">
          {timeFormatter.format(trade.timestamp)}
        </div>
      </div>
      <div className={`font-data text-right ${directionClass}`}>{formatPrice(trade.price)}</div>
      <div className="font-data text-right text-stone-300">{formatQuantity(trade.quantity)}</div>
    </div>
  );
};

export const MarketTicker: FC = () => {
  const tickers = useMarketStore((state) => state.tickers);
  const selectedSymbol = useMarketStore((state) => state.selectedSymbol);
  const recentTrades = useMarketStore((state) => state.recentTrades);
  const setSelectedSymbol = useMarketStore((state) => state.setSelectedSymbol);
  const [now, setNow] = useState(() => Date.now());

  useMarketSocket(socketSymbols);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(interval);
  }, []);

  const orderedTickers = MARKET_SYMBOLS.map((market) => tickers[market.symbol]);
  const selectedTicker = tickers[selectedSymbol] ?? orderedTickers[0];

  const leader = orderedTickers.reduce((currentLeader, ticker) => {
    if (!currentLeader) {
      return ticker;
    }

    return Math.abs(getSessionChange(ticker)) > Math.abs(getSessionChange(currentLeader))
      ? ticker
      : currentLeader;
  }, orderedTickers[0]);

  const liveCount = orderedTickers.filter(
    (ticker) => ticker.lastUpdated && now - ticker.lastUpdated < 3_000,
  ).length;

  const totalTrades = orderedTickers.reduce((sum, ticker) => sum + ticker.tradeCount, 0);
  const selectedChange = selectedTicker ? getSessionChange(selectedTicker) : 0;
  const selectedRange = selectedTicker ? getRangeFill(selectedTicker) : 50;
  const selectedMomentum = selectedTicker
    ? selectedTicker.direction === "up"
      ? "Bid pressure"
      : selectedTicker.direction === "down"
        ? "Supply leaning"
        : "Balanced"
    : "Waiting";

  return (
    <section className="space-y-6 text-stone-50">
      <div className={`${panelClassName} overflow-hidden p-6 md:p-8`}>
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[0.68rem] uppercase tracking-[0.28em] text-stone-300">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.85)]" />
              Binance spot stream
            </div>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[0.04em] text-stone-50 md:text-6xl">
              Quant View
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300 md:text-lg">
              Live tape for the majors, with session movement, observed range, and a focused
              trade monitor driven directly from Binance websockets.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/8 bg-white/4 px-5 py-4">
              <div className="text-[0.68rem] uppercase tracking-[0.24em] text-stone-400">
                Feed status
              </div>
              <div className="mt-3 font-data text-3xl text-stone-50">
                {liveCount}/{orderedTickers.length}
              </div>
              <div className="mt-2 text-sm text-stone-300">Symbols reporting inside 3 seconds</div>
            </div>

            <div className="rounded-[1.5rem] border border-white/8 bg-white/4 px-5 py-4">
              <div className="text-[0.68rem] uppercase tracking-[0.24em] text-stone-400">
                Pulse leader
              </div>
              <div className="mt-3 text-2xl text-stone-50">{leader?.baseAsset ?? "Waiting"}</div>
              <div className="mt-2 text-sm text-stone-300">
                {leader ? formatPercent(getSessionChange(leader)) : "No movement yet"}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/8 bg-white/4 px-5 py-4">
              <div className="text-[0.68rem] uppercase tracking-[0.24em] text-stone-400">
                Tape count
              </div>
              <div className="mt-3 font-data text-3xl text-stone-50">
                {compactFormatter.format(totalTrades)}
              </div>
              <div className="mt-2 text-sm text-stone-300">Trades observed since this session opened</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {orderedTickers.map((ticker) => (
            <MarketCard
              isSelected={ticker.symbol === selectedSymbol}
              key={ticker.symbol}
              now={now}
              onSelect={() => setSelectedSymbol(ticker.symbol)}
              ticker={ticker}
            />
          ))}
        </div>

        <aside className={`${panelClassName} p-6`}>
          {selectedTicker ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.72rem] uppercase tracking-[0.28em] text-stone-400">
                    Focus board
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[0.04em] text-stone-50">
                    {selectedTicker.label}
                  </h2>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-stone-300">
                    {selectedTicker.blurb}
                  </p>
                </div>

                <div
                  className="rounded-full px-3 py-1 text-[0.68rem] uppercase tracking-[0.2em]"
                  style={{
                    backgroundColor: hexToRgba(selectedTicker.accent, 0.16),
                    color: selectedTicker.accent,
                  }}
                >
                  {selectedMomentum}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.24em] text-stone-400">
                      Last trade
                    </p>
                    <div className="mt-3 font-data text-5xl text-stone-50">
                      {formatPrice(selectedTicker.price)}
                    </div>
                  </div>

                  <div className={`text-right text-sm ${getDirectionTone(selectedTicker.direction)}`}>
                    <div className="uppercase tracking-[0.2em] text-stone-400">Session move</div>
                    <div className="mt-2 font-data text-2xl">{formatPercent(selectedChange)}</div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-[0.72rem] uppercase tracking-[0.2em] text-stone-400">
                    <span>Observed range</span>
                    <span>{formatRange(selectedTicker)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(Math.max(selectedRange, 0), 100)}%`,
                        background: `linear-gradient(90deg, ${hexToRgba(selectedTicker.accent, 0.32)} 0%, ${selectedTicker.accent} 100%)`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[1.35rem] border border-white/8 bg-white/4 px-4 py-4">
                  <div className="text-[0.68rem] uppercase tracking-[0.22em] text-stone-400">
                    Trades seen
                  </div>
                  <div className="mt-3 font-data text-2xl text-stone-50">
                    {compactFormatter.format(selectedTicker.tradeCount)}
                  </div>
                </div>
                <div className="rounded-[1.35rem] border border-white/8 bg-white/4 px-4 py-4">
                  <div className="text-[0.68rem] uppercase tracking-[0.22em] text-stone-400">
                    Last size
                  </div>
                  <div className="mt-3 font-data text-2xl text-stone-50">
                    {formatQuantity(selectedTicker.lastQuantity)}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/8 bg-white/4 p-5">
                <div className="text-[0.68rem] uppercase tracking-[0.22em] text-stone-400">
                  Last update
                </div>
                <div className="mt-3 text-lg text-stone-50">
                  {selectedTicker.lastUpdated
                    ? timeFormatter.format(selectedTicker.lastUpdated)
                    : "Waiting for first trade"}
                </div>
                <div className="mt-2 text-sm text-stone-300">
                  Binance trade events are streamed per symbol and merged into this local session
                  model.
                </div>
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className={`${panelClassName} p-6`}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.28em] text-stone-400">
                Market pulse
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[0.04em] text-stone-50">
                Basket rotation
              </h2>
            </div>
            <div className="text-sm text-stone-300">Observed since page load</div>
          </div>

          <div className="mt-6 space-y-3">
            {orderedTickers.map((ticker) => {
              const change = getSessionChange(ticker);
              const fill = getRangeFill(ticker);

              return (
                <button
                  className="grid w-full gap-3 rounded-[1.4rem] border border-white/8 bg-white/4 px-4 py-4 text-left transition hover:border-white/14 hover:bg-white/6 md:grid-cols-[1.1fr_0.9fr_1.3fr]"
                  key={ticker.symbol}
                  onClick={() => setSelectedSymbol(ticker.symbol)}
                  type="button"
                >
                  <div>
                    <div className="text-lg text-stone-50">{ticker.baseAsset}</div>
                    <div className="mt-1 text-[0.72rem] uppercase tracking-[0.22em] text-stone-400">
                      {ticker.label}
                    </div>
                  </div>

                  <div className="font-data text-stone-100">
                    <div className="text-xl">{formatPrice(ticker.price)}</div>
                    <div className={`mt-1 text-sm ${getDirectionTone(ticker.direction)}`}>
                      {formatPercent(change)}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-[0.68rem] uppercase tracking-[0.2em] text-stone-400">
                      <span>Range position</span>
                      <span>{Math.round(fill)}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(Math.max(fill, 0), 100)}%`,
                          background: `linear-gradient(90deg, ${hexToRgba(ticker.accent, 0.24)} 0%, ${ticker.accent} 100%)`,
                        }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className={`${panelClassName} p-6`}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.28em] text-stone-400">Live tape</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[0.04em] text-stone-50">
                Recent trades
              </h2>
            </div>
            <div className="text-sm text-stone-300">Last {recentTrades.length} prints</div>
          </div>

          <div className="mt-6 space-y-3">
            {recentTrades.length ? (
              recentTrades.map((trade) => <TapeRow key={trade.id} trade={trade} />)
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/4 px-4 py-6 text-sm text-stone-300">
                Waiting for websocket events. The tape will populate as Binance trades arrive.
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
};
