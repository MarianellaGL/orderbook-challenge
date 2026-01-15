
import { config } from "../../shared";

const WS_BASE_URL = config.binance.wsUrl;

export interface DepthDelta {
  e: string;  
  E: number;  
  s: string;  
  U: number;  
  u: number; 
  b: [string, string][]; 
  a: [string, string][]; 
}

export interface WebSocketConfig {
  symbol: string;
  onMessage: (delta: DepthDelta) => void;
  onOpen: () => void;
  onClose: (wasClean: boolean, code: number) => void;
  onError: () => void;
}


export function createDepthWebSocket(config: WebSocketConfig): () => void {
  const { symbol, onMessage, onOpen, onClose, onError } = config;

  const ws = new WebSocket(
    `${WS_BASE_URL}/${symbol.toLowerCase()}@depth@1000ms`
  );

  ws.onopen = onOpen;

  ws.onmessage = (event) => {
    try {
      const data: DepthDelta = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
    }
  };

  ws.onerror = onError;

  ws.onclose = (event) => {
    onClose(event.wasClean, event.code);
  };

  return () => {
    ws.close();
  };
}
