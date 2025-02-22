import { useState, useEffect } from 'react';
import { getWebSocket } from '@/services/websocket';

export const useStockWebSocket = (ticker?: string) => {
  const [price, setPrice] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!ticker) return;

    console.log(`Setting up WebSocket for ${ticker}`);

    const handleUpdate = (data: any) => {
      //console.log(`Received WebSocket data for ${ticker}:`, data);
      // Update price based on last trade price or latest quote
      const newPrice = data.lp || data.ap;
      if (newPrice) {
        //console.log(`Updating price for ${ticker} from ${price} to ${newPrice}`);
        setPrice(newPrice);
        setLastUpdate(new Date(data.t));
      }
    };

    let isSubscribed = true;

    getWebSocket()
      .then(ws => {
        if (isSubscribed) {
          console.log(`Subscribing to ${ticker} WebSocket updates`);
          ws.subscribe(ticker, handleUpdate);
        }
        return () => {
          if (isSubscribed) {
            console.log(`Unsubscribing from ${ticker} WebSocket updates`);
            ws.unsubscribe(ticker, handleUpdate);
          }
        };
      })
      .catch(error => {
        console.error('Failed to initialize WebSocket:', error);
      });

    return () => {
      isSubscribed = false;
    };
  }, [ticker]);

  return { price, lastUpdate };
};