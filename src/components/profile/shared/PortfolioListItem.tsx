// src/pages/profile/components/shared/PortfolioListItem.tsx
import React from 'react';
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { PortfolioData } from '../types';

interface PortfolioListItemProps {
  portfolio: PortfolioData;
  onClick: () => void;
}

export const PortfolioListItem: React.FC<PortfolioListItemProps> = ({ 
  portfolio, 
  onClick
}) => {
  // Check if day change percent value is valid
  const hasValidDayChange = portfolio.dayChangePercent !== null && 
                            portfolio.dayChangePercent !== undefined && 
                            !isNaN(Number(portfolio.dayChangePercent));
                            
  // Format totalValue to display as currency
  const formattedValue = typeof portfolio.totalValue === 'string' 
    ? parseFloat(portfolio.totalValue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
    : (portfolio.totalValue || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

  return (
    <button 
      className="w-full group transition-all duration-300 hover:scale-[1.01]"
      onClick={onClick}
      aria-label={`View portfolio: ${portfolio.name}`}
    >
      <div className="py-3 px-4 bg-gradient-to-br from-white to-gray-50/90 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-gray-800">
              {portfolio.name}
            </h3>
            <span className="text-sm text-gray-500 font-medium">
              ${formattedValue}
            </span>
          </div>
          
          {/* Today's Performance */}
          {hasValidDayChange ? (
            <div className={`flex items-center ${Number(portfolio.dayChangePercent) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Number(portfolio.dayChangePercent) >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(Number(portfolio.dayChangePercent)).toFixed(2)}%
              </span>
            </div>
          ) : (
            <div className="flex items-center text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">
                --
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};