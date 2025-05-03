import { useState, useEffect } from "react";
import { getWebSocket } from "@/services/websocket";

export const useStockWebSocket = (symbol?: string) => {
  const [price, setPrice] = useState<number | null>(null);

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

    const setup = async () => {
      try {
        const ws = await getWebSocket();
        if (!isSubscribed) return;

        ws.subscribe(symbol, handlePrice);
        cleanup = () => {
          ws.unsubscribe(symbol, handlePrice);
        };
      } catch (error) {
        console.error("WebSocket setup failed:", error);
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
