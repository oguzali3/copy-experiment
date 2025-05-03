import { useState, useEffect } from "react";

// SOLUTION: Accept 'ticker' as a parameter
export const useStockWebSocket = (ticker: string | undefined | null) => {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    // SOLUTION: Add a guard clause in case ticker is not yet available
    if (!ticker) {
      console.log("Ticker not provided, skipping WebSocket connection.");
      setPrice(null); // Reset price if ticker is removed
      return; // Don't proceed further
    }

    // Now 'ticker' is defined and refers to the parameter passed to the hook
    console.log("Setting up WebSocket for ticker:", ticker); // Should work now (line 8 or similar)
    const ws = new WebSocket(
      `wss://your-websocket-url/stream?symbol=${ticker}`
    ); // Replace with your actual WS URL

    ws.onopen = () => {
      console.log(`WebSocket connected for ${ticker}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Adjust this based on your actual WebSocket message structure
        if (data && typeof data.p === "number" && data.s === ticker) {
          setPrice(data.p);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket Error for ${ticker}:`, error);
    };

    ws.onclose = (event) => {
      console.log(
        `WebSocket disconnected for ${ticker}. Code: ${event.code}, Reason: ${event.reason}`
      );
      // Optional: Implement reconnection logic here
    };

    // Cleanup function: Close the WebSocket when the component unmounts
    // or when the 'ticker' dependency changes.
    return () => {
      console.log("Closing WebSocket for ticker:", ticker);
      ws.close();
    };

    // SOLUTION: Include 'ticker' in the dependency array
  }, [ticker]); // The effect re-runs if 'ticker' changes

  return { price };
};
