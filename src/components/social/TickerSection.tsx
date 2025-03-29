// src/components/search/TickersSection.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/loaders';
import { TickerComponent } from '@/components/social/TickerComponent';

interface TickersSectionProps {
  isLoading: boolean;
  tickers: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
  }>;
  query: string;
}

const TickersSection: React.FC<TickersSectionProps> = ({ isLoading, tickers, query }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spinner size="lg" label="Loading tickers..." />
      </div>
    );
  }
  
  if (tickers.length === 0) {
    return (
      <div className="text-center p-12 text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow">
        No tickers found matching "{query}"
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tickers.map(ticker => (
        <TickerComponent key={ticker.symbol} ticker={ticker} />
      ))}
    </div>
  );
};

export default TickersSection;