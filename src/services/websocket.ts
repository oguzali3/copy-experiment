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
  private maxReconnectAttempts = 10;
  private reconnectDelay = 2000;
  private isConnecting = false;
  private pendingSubscriptions: Set<string> = new Set();

  constructor(apiKey: string) {
    console.log('Initializing StockWebSocket');
    this.apiKey = apiKey;
    this.connect();
  }

  private async connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    if (this.isConnecting) {
      console.log('WebSocket connection already in progress');
      return;
    }

    this.isConnecting = true;
    console.log('Connecting to WebSocket...');
    
    try {
      this.ws = new WebSocket('wss://websockets.financialmodelingprep.com');

      this.ws.onopen = () => {
        console.log('WebSocket connection established');
        this.isConnecting = false;
        const loginMessage = {
          event: "login",
          data: { apiKey: this.apiKey }
        };
        console.log('Sending login message:', JSON.stringify(loginMessage).replace(this.apiKey, '[REDACTED]'));
        this.ws?.send(JSON.stringify(loginMessage));

        // Resubscribe to all tickers
        const allTickers = Array.from(this.subscribers.keys());
        if (allTickers.length > 0) {
          this.pendingSubscriptions = new Set(allTickers);
          console.log('Resubscribing to tickers:', allTickers);
          // Send individual subscription messages for each ticker
          allTickers.forEach(ticker => {
            this.ws?.send(JSON.stringify({
              event: "subscribe",
              data: {
                ticker: ticker.toUpperCase(),
                type: ["trade", "quote"]
              }
            }));
          });
        }

        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket message received:', message);
          
          if (message.event === 'login') {
            console.log('Login response:', message);
          } else if (message.event === 'subscribe') {
            console.log('Subscribe response:', message);
            if (message.status === 200 && message.data?.ticker) {
              this.pendingSubscriptions.delete(message.data.ticker.toLowerCase());
            }
          } else if (message.event === 'heartbeat') {
            // Silently handle heartbeat messages
            return;
          } else if (message.s) {
            const ticker = message.s.toLowerCase();
            if (ticker && this.subscribers.has(ticker)) {
              this.subscribers.get(ticker)?.forEach(callback => callback(message));
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error, 'Raw message:', event.data);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event);
        this.isConnecting = false;
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = this.reconnectDelay * Math.min(this.reconnectAttempts, 5);
          console.log(`Attempting reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          setTimeout(() => this.connect(), delay);
        } else {
          console.error('Max reconnection attempts reached');
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.isConnecting = false;
    }
  }

  subscribe(ticker: string, callback: WebSocketSubscriber) {
    ticker = ticker.toLowerCase();
    console.log(`Subscribing to ${ticker}`);
    
    if (!this.subscribers.has(ticker)) {
      this.subscribers.set(ticker, new Set());
      if (this.ws?.readyState === WebSocket.OPEN) {
        const subscribeMessage = {
          event: "subscribe",
          data: {
            ticker: ticker.toUpperCase(),
            type: ["trade", "quote"]
          }
        };
        console.log('Sending subscribe message:', subscribeMessage);
        this.ws.send(JSON.stringify(subscribeMessage));
        this.pendingSubscriptions.add(ticker);
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
        this.pendingSubscriptions.delete(ticker);
        if (this.ws?.readyState === WebSocket.OPEN) {
          const unsubscribeMessage = {
            event: "unsubscribe",
            data: {
              ticker: ticker.toUpperCase(),
              type: ["trade", "quote"]
            }
          };
          console.log('Sending unsubscribe message:', unsubscribeMessage);
          this.ws.send(JSON.stringify(unsubscribeMessage));
        }
      }
    }
  }

  disconnect() {
    console.log('Disconnecting WebSocket');
    this.ws?.close();
    this.ws = null;
    this.subscribers.clear();
    this.pendingSubscriptions.clear();
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