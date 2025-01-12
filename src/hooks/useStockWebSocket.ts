import { useState, useEffect } from 'react';
import { getWebSocket } from '@/services/websocket';

export const useStockWebSocket = (ticker?: string) => {
  const [price, setPrice] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!ticker) return;

    const handleUpdate = (data: any) => {
      // Update price based on last trade price or latest quote
      const newPrice = data.lp || data.ap;
      if (newPrice) {
        setPrice(newPrice);
        setLastUpdate(new Date(data.t));
      }
    };

    getWebSocket()
      .then(ws => {
        ws.subscribe(ticker, handleUpdate);
        return () => ws.unsubscribe(ticker, handleUpdate);
      })
      .catch(error => {
        console.error('Failed to initialize WebSocket:', error);
      });
  }, [ticker]);

  return { price, lastUpdate };
};