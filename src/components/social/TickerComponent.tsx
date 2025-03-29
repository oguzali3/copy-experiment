// src/components/social/TickerComponent.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign } from 'lucide-react';

interface TickerComponentProps {
  ticker: {
    symbol: string;
    name: string;
    price: number;
    changePercent: number;
  };
}

export const TickerComponent: React.FC<TickerComponentProps> = ({ ticker }) => {
  const navigate = useNavigate();
  
  const handleTickerClick = () => {
    navigate(`/?q=${encodeURIComponent('$' + ticker.symbol)}`);
  };
  
  return (
    <div 
      className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
      onClick={handleTickerClick}
    >
      <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 p-3 rounded-full mr-4">
        <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-lg">${ticker.symbol}</h3>
        <div className="text-sm text-gray-500">
          {ticker.name}
        </div>
      </div>
      <div className={`text-lg font-semibold ${
        ticker.changePercent < 0 ? 'text-red-500' : 'text-green-500'
      }`}>
        {ticker.price.toFixed(2)}
        <div className="text-sm">
          {ticker.changePercent > 0 ? '+' : ''}
          {ticker.changePercent.toFixed(2)}%
        </div>
      </div>
    </div>
  );
};