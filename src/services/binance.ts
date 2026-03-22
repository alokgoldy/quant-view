const BINANCE_WS = "wss://stream.binance.com:9443/ws";

export const createTradeSocket = (symbol: string) => {
    return new WebSocket(`${BINANCE_WS}/${symbol}@trade`);
}