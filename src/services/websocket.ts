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
    console.log('Initializing StockWebSocket with API key length:', apiKey?.length || 0);
    this.apiKey = apiKey;
    this.connect();
  }

  private connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    console.log('Connecting to WebSocket...');
    this.ws = new WebSocket('wss://websockets.financialmodelingprep.com');

    this.ws.onopen = () => {
      console.log('WebSocket connection established, sending login...');
      const loginMessage = JSON.stringify({
        event: "login",
        data: { apiKey: this.apiKey }
      });
      console.log('Login message:', loginMessage.replace(this.apiKey, '[REDACTED]'));
      this.ws?.send(loginMessage);

      // Resubscribe to all tickers
      const allTickers = Array.from(this.subscribers.keys());
      if (allTickers.length > 0) {
        console.log('Resubscribing to tickers:', allTickers);
        this.ws?.send(JSON.stringify({
          event: "subscribe",
          data: { ticker: allTickers }
        }));
      }

      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('WebSocket message received:', message);
        
        // If it's a trade or quote message
        if (message.s) {
          const ticker = message.s.toLowerCase();
          if (ticker && this.subscribers.has(ticker)) {
            console.log(`Dispatching ${ticker} update to ${this.subscribers.get(ticker)?.size} subscribers`);
            this.subscribers.get(ticker)?.forEach(callback => callback(message));
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event);
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * this.reconnectAttempts;
        console.log(`Attempting reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        setTimeout(() => this.connect(), delay);
      } else {
        console.error('Max reconnection attempts reached');
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
        const subscribeMessage = JSON.stringify({
          event: "subscribe",
          data: { ticker: ticker }
        });
        console.log('Sending subscribe message:', subscribeMessage);
        this.ws.send(subscribeMessage);
      } else {
        console.warn(`WebSocket not ready (state: ${this.ws?.readyState}), subscription will be sent when connected`);
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
          const unsubscribeMessage = JSON.stringify({
            event: "unsubscribe",
            data: { ticker: ticker }
          });
          console.log('Sending unsubscribe message:', unsubscribeMessage);
          this.ws.send(unsubscribeMessage);
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
      console.log('Fetching FMP API key from Supabase...');
      const { data: { FMP_API_KEY }, error } = await supabase.functions.invoke('get-secret', {
        body: { name: 'FMP_API_KEY' }
      });
      
      if (error || !FMP_API_KEY) {
        console.error('Failed to get FMP API key:', error);
        throw new Error('Failed to get FMP API key');
      }
      
      console.log('Successfully retrieved API key, initializing WebSocket...');
      websocketInstance = new StockWebSocket(FMP_API_KEY);
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      throw error;
    }
  }
  return websocketInstance;
};