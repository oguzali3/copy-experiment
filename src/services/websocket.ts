import { supabase } from "@/integrations/supabase/client";

type WebSocketMessage = {
  s: string;  // ticker
  t: number;  // timestamp
  type: 'T' | 'Q' | 'B';  // Trade, Quote, Break
  ap?: number;  // ask price
  as?: number;  // ask size
  bp?: number;  // bid price
  bs?: number;  // bid size
  lp?: number;  // last price
  ls?: number;  // last size
};

type WebSocketSubscriber = (data: WebSocketMessage) => void;

class StockWebSocket {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<WebSocketSubscriber>> = new Map();
  private apiKey: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.connect();
  }

  private connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    console.log('Initializing WebSocket connection...');
    this.ws = new WebSocket('wss://websockets.financialmodelingprep.com');

    this.ws.onopen = () => {
      console.log('WebSocket connected, sending login...');
      // Login with API key
      this.ws?.send(JSON.stringify({
        event: "login",
        data: { apiKey: this.apiKey }
      }));

      // Resubscribe to all tickers
      const allTickers = Array.from(this.subscribers.keys());
      if (allTickers.length > 0) {
        console.log('Resubscribing to tickers:', allTickers);
        this.ws?.send(JSON.stringify({
          event: "subscribe",
          data: { ticker: allTickers }
        }));
      }

      // Reset reconnect attempts on successful connection
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('WebSocket message received:', message);
        const ticker = message.s?.toLowerCase();
        if (ticker && this.subscribers.has(ticker)) {
          this.subscribers.get(ticker)?.forEach(callback => callback(message));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  subscribe(ticker: string, callback: WebSocketSubscriber) {
    ticker = ticker.toLowerCase();
    console.log(`Subscribing to ${ticker}`);
    if (!this.subscribers.has(ticker)) {
      this.subscribers.set(ticker, new Set());
      if (this.ws?.readyState === WebSocket.OPEN) {
        console.log(`Sending subscribe message for ${ticker}`);
        this.ws.send(JSON.stringify({
          event: "subscribe",
          data: { ticker: ticker }
        }));
      }
    }
    this.subscribers.get(ticker)?.add(callback);
  }

  unsubscribe(ticker: string, callback: WebSocketSubscriber) {
    ticker = ticker.toLowerCase();
    console.log(`Unsubscribing from ${ticker}`);
    const tickerSubscribers = this.subscribers.get(ticker);
    if (tickerSubscribers) {
      tickerSubscribers.delete(callback);
      if (tickerSubscribers.size === 0) {
        this.subscribers.delete(ticker);
        if (this.ws?.readyState === WebSocket.OPEN) {
          console.log(`Sending unsubscribe message for ${ticker}`);
          this.ws.send(JSON.stringify({
            event: "unsubscribe",
            data: { ticker: ticker }
          }));
        }
      }
    }
  }

  disconnect() {
    console.log('Disconnecting WebSocket');
    this.ws?.close();
    this.ws = null;
    this.subscribers.clear();
  }
}

// Create singleton instance
let websocketInstance: StockWebSocket | null = null;

export const getWebSocket = async () => {
  if (!websocketInstance) {
    try {
      const { data: { FMP_API_KEY }, error } = await supabase.functions.invoke('get-secret', {
        body: { name: 'FMP_API_KEY' }
      });
      
      if (error || !FMP_API_KEY) {
        throw new Error('Failed to get FMP API key');
      }
      
      websocketInstance = new StockWebSocket(FMP_API_KEY);
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      throw error;
    }
  }
  return websocketInstance;
};