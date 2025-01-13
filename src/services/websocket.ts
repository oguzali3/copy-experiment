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
  private static instance: StockWebSocket | null = null;
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<WebSocketSubscriber>> = new Map();
  private apiKey: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private pendingSubscriptions: Set<string> = new Set();
  private isAuthenticated = false;
  private connectionId: string | null = null;
  private reconnectTimeout: number | null = null;
  private lastConnectionAttempt: number = 0;
  private minReconnectInterval = 2000; // Minimum 2 seconds between connection attempts

  private constructor(apiKey: string) {
    console.log('Initializing StockWebSocket');
    this.apiKey = apiKey;
    this.connect();
  }

  public static async getInstance(): Promise<StockWebSocket> {
    if (!StockWebSocket.instance) {
      const { data: { FMP_API_KEY }, error } = await supabase.functions.invoke('get-secret', {
        body: { name: 'FMP_API_KEY' }
      });
      
      if (error || !FMP_API_KEY) {
        console.error('Failed to get FMP API key:', error);
        throw new Error('Failed to get FMP API key');
      }
      
      StockWebSocket.instance = new StockWebSocket(FMP_API_KEY);
    }
    return StockWebSocket.instance;
  }

  private async connect() {
    const now = Date.now();
    if (now - this.lastConnectionAttempt < this.minReconnectInterval) {
      console.log('Throttling connection attempts');
      return;
    }
    this.lastConnectionAttempt = now;

    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    if (this.isConnecting) {
      console.log('Connection already in progress');
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.isConnecting = true;
    console.log('Connecting to WebSocket...');
    
    try {
      this.ws = new WebSocket('wss://websockets.financialmodelingprep.com');

      this.ws.onopen = () => {
        console.log('WebSocket connection established');
        this.isConnecting = false;
        this.authenticate();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket message received:', message);
          
          if (message.event === 'login') {
            this.handleLoginResponse(message);
          } else if (message.event === 'subscribe') {
            this.handleSubscribeResponse(message);
          } else if (message.event === 'heartbeat') {
            // Silently handle heartbeat messages
          } else if (message.s) {
            this.handleStockUpdate(message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event);
        this.isConnecting = false;
        
        if (event.code === 1005) {
          console.log('Clean disconnect, resetting connection state');
          this.reset();
          return;
        }
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000);
          console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
          this.reconnectTimeout = window.setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
          }, delay);
        } else {
          console.error('Max reconnection attempts reached');
          this.reset();
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

  private authenticate() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log('Cannot authenticate - WebSocket not connected');
      return;
    }

    const loginMessage = {
      event: "login",
      data: { 
        apiKey: this.apiKey,
        connectionId: this.connectionId
      }
    };
    console.log('Sending login message:', JSON.stringify(loginMessage).replace(this.apiKey, '[REDACTED]'));
    this.ws.send(JSON.stringify(loginMessage));
  }

  private handleLoginResponse(message: any) {
    console.log('Login response:', message);
    if (message.status === 200) {
      this.isAuthenticated = true;
      this.reconnectAttempts = 0;
      this.connectionId = message.connectionId || this.connectionId;
      this.resubscribeAll();
    } else if (message.status === 401) {
      if (message.message === 'Connected from another location') {
        console.log('Connection conflict detected, resetting connection');
        this.reset();
      } else {
        console.log('Authentication failed');
        this.reset();
      }
    }
  }

  private handleSubscribeResponse(message: any) {
    console.log('Subscribe response:', message);
    if (message.status === 200 && message.data?.ticker) {
      this.pendingSubscriptions.delete(message.data.ticker.toLowerCase());
    } else if (message.status === 401) {
      this.authenticate();
    }
  }

  private handleStockUpdate(message: WebSocketMessage) {
    const ticker = message.s.toLowerCase();
    if (ticker && this.subscribers.has(ticker)) {
      this.subscribers.get(ticker)?.forEach(callback => callback(message));
    }
  }

  private resubscribeAll() {
    const allTickers = Array.from(this.subscribers.keys());
    if (allTickers.length > 0) {
      this.pendingSubscriptions = new Set(allTickers);
      console.log('Resubscribing to tickers:', allTickers);
      allTickers.forEach(ticker => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            event: "subscribe",
            data: {
              ticker: ticker.toUpperCase(),
              type: ["trade", "quote"]
            }
          }));
        }
      });
    }
  }

  private reset() {
    console.log('Resetting WebSocket connection state');
    this.reconnectAttempts = 0;
    this.isAuthenticated = false;
    this.connectionId = null;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.ws?.close();
    this.ws = null;
    StockWebSocket.instance = null;
  }

  subscribe(ticker: string, callback: WebSocketSubscriber) {
    ticker = ticker.toLowerCase();
    console.log(`Subscribing to ${ticker}`);
    
    if (!this.subscribers.has(ticker)) {
      this.subscribers.set(ticker, new Set());
      if (this.ws?.readyState === WebSocket.OPEN && this.isAuthenticated) {
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
        if (this.ws?.readyState === WebSocket.OPEN && this.isAuthenticated) {
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
    this.reset();
  }
}

export const getWebSocket = async () => {
  return StockWebSocket.getInstance();
};