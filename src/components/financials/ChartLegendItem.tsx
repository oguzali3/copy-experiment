import React from 'react';

interface ChartLegendItemProps {
  color: string;
  ticker: string;
  metricName: string;
  totalChange: number;
  cagr: number;
}

export const ChartLegendItem = ({ 
  color, 
  ticker, 
  metricName, 
  totalChange, 
  cagr 
}: ChartLegendItemProps) => {
  return (
    <div className="flex items-center gap-3">
      <div 
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-gray-900 font-medium">
        {ticker} - {metricName} (Annual) (Total Change: {totalChange.toFixed(2)}%) (CAGR: {cagr.toFixed(2)}%)
      </span>
    </div>
  );
};