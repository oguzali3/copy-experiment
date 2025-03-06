// src/pages/profile/components/shared/PortfolioListItem.tsx
import React from 'react';
import { TrendingUp, TrendingDown } from "lucide-react";
import { PortfolioData } from '../types';

interface PortfolioListItemProps {
  portfolio: PortfolioData;
  onClick: () => void;
}

export const PortfolioListItem: React.FC<PortfolioListItemProps> = ({ portfolio, onClick }) => {
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
              ${portfolio.totalValue?.toLocaleString() || '0'}
            </span>
          </div>
          {portfolio.yearlyPerformance !== null && (
            <div className={`flex items-center ${portfolio.yearlyPerformance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {portfolio.yearlyPerformance >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(portfolio.yearlyPerformance).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};