
import { useState, useEffect } from 'react';
import { getWebSocket } from '@/services/websocket';

export const useStockWebSocket = (ticker?: string) => {
  const [price, setPrice] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let isSubscribed = true;

    if (!ticker) return;

    console.log(`Setting up WebSocket for ${ticker}`);

    const handleUpdate = (data: any) => {
      if (!isSubscribed) return;
      
      console.log(`Received WebSocket data for ${ticker}:`, data);
      const newPrice = data.lp || data.ap;
      if (newPrice) {
        console.log(`Updating price for ${ticker} from ${price} to ${newPrice}`);
        setPrice(newPrice);
        setLastUpdate(new Date(data.t));
      }
    };

    const setupWebSocket = async () => {
      try {
        const ws = await getWebSocket();
        if (!isSubscribed) return;

        console.log(`Subscribing to ${ticker} WebSocket updates`);
        ws.subscribe(ticker, handleUpdate);
        cleanup = () => {
          console.log(`Cleaning up WebSocket for ${ticker}`);
          ws.unsubscribe(ticker, handleUpdate);
        };
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
      }
    };

    setupWebSocket();

    return () => {
      console.log(`Unmounting WebSocket hook for ${ticker}`);
      isSubscribed = false;
      if (cleanup) {
        cleanup();
      }
    };
  }, [ticker]);

  return { price, lastUpdate };
};
