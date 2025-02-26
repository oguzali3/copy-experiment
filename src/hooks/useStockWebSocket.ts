
import { useState, useEffect } from 'react';
import { getWebSocket } from '@/services/websocket';

export const useStockWebSocket = (symbol?: string) => {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    if (!symbol) return;

    let isSubscribed = true;
    let cleanup: (() => void) | undefined;

    const handlePrice = (data: any) => {
      if (!isSubscribed) return;
      if (data.lp) {
        setPrice(data.lp);
      }
    };

    const setup = async () => {
      try {
        const ws = await getWebSocket();
        if (!isSubscribed) return;

        ws.subscribe(symbol, handlePrice);
        cleanup = () => {
          ws.unsubscribe(symbol, handlePrice);
        };
      } catch (error) {
        console.error('WebSocket setup failed:', error);
      }
    };

    setup();

    return () => {
      isSubscribed = false;
      if (cleanup) cleanup();
    };
  }, [symbol]);

  return { price };
};
