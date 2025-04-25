import { ArrowUpIcon, ArrowDownIcon, DollarSign, PieChart, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Stock } from "./types";
import { FC, memo, useEffect, useState, useMemo } from "react";
import { ensureNumber } from "@/utils/portfolioDataUtils";

interface PortfolioSummaryCardsProps {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  stocks: Stock[];
  previousDayValue?: number;
  key?: string; // Add a key prop to force re-rendering
}

// Using memo to prevent unnecessary re-renders
const PortfolioSummaryCards: FC<PortfolioSummaryCardsProps> = memo(({
  totalValue,
  dayChange,
  dayChangePercent,
  stocks,
  previousDayValue
}) => {
  // Use useMemo instead of useState for calculated values to avoid stale state
  const displayedValues = useMemo(() => {
    // Normalize input values
    const safeTotal = ensureNumber(totalValue);
    const safePrevious = ensureNumber(previousDayValue) || safeTotal;
    // Log input values
    console.group('PortfolioSummaryCards - Day Change Calculation');
    console.log('Raw inputs:');
    console.log('totalValue:', totalValue, typeof totalValue);
    console.log('previousDayValue:', previousDayValue, typeof previousDayValue);
    console.log('dayChange from backend:', dayChange, typeof dayChange);
    console.log('dayChangePercent from backend:', dayChangePercent, typeof dayChangePercent);

    // Log normalized values
    console.log('\nNormalized inputs:');
    console.log('safeTotal:', safeTotal);
    console.log('safePrevious:', safePrevious);
    // Calculate change values
    const calculatedChange = safeTotal - safePrevious;
    let calculatedPercent = 0;
    
    if (safePrevious > 0) {
      calculatedPercent = (calculatedChange / safePrevious) * 100;
    }
        // Log calculated values
    console.log('\nCalculated values:');
    console.log('calculatedChange:', calculatedChange);
    console.log('calculatedPercent:', calculatedPercent);

    // Use provided values if valid, otherwise use calculated ones
    const finalDayChange = ensureNumber(dayChange) || calculatedChange;
    const finalDayChangePercent = ensureNumber(dayChangePercent) || calculatedPercent;
    
    // Calculate top positions
    const validStocks = stocks.filter(stock => {
      const marketValue = ensureNumber(stock.marketValue);
      return marketValue > 0;
    });
    
    const sortedStocks = [...validStocks].sort((a, b) => 
      ensureNumber(b.marketValue) - ensureNumber(a.marketValue)
    );
    // Log final values
    console.log('\nFinal values:');
    console.log('finalDayChange:', finalDayChange);
    console.log('finalDayChangePercent:', finalDayChangePercent);
    console.groupEnd();
    const topPositions = sortedStocks.slice(0, 3);
    
    return {
      totalValue: safeTotal,
      dayChange: finalDayChange,
      dayChangePercent: finalDayChangePercent,
      previousValue: safePrevious,
      topPositions
    };
  }, [totalValue, dayChange, dayChangePercent, stocks, previousDayValue]);

  // Log the values when they change for debugging
  useEffect(() => {
    console.log('Summary card values updated:', {
      totalValue: displayedValues.totalValue,
      dayChange: displayedValues.dayChange,
      dayChangePercent: displayedValues.dayChangePercent
    });
  }, [displayedValues]);

  // Format currency values consistently
  const formatCurrency = (value: number) => {
    if (value === undefined || isNaN(value)) {
      return "$0.00";
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Value Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <h3 className="text-2xl font-bold mt-1">
                {formatCurrency(displayedValues.totalValue)}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Day Change Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Today's Change</p>
              <div className="flex items-center mt-1">
                <h3 className={`text-2xl font-bold ${displayedValues.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(displayedValues.dayChange))}
                </h3>
                <span className={`ml-2 flex items-center ${displayedValues.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {displayedValues.dayChange >= 0 ? (
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(displayedValues.dayChangePercent).toFixed(2)}%
                </span>
              </div>
            </div>
            <div className={`h-12 w-12 rounded-full ${displayedValues.dayChange >= 0 ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
              <TrendingUp className={`h-6 w-6 ${displayedValues.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Portfolio Diversity Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Portfolio Diversity</p>
              <h3 className="text-2xl font-bold mt-1">{stocks.length} Assets</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <PieChart className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Top Holdings Card */}
      <Card>
        <CardContent className="pt-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Top Holdings</p>
            <div className="mt-2 space-y-1.5">
              {displayedValues.topPositions.map((stock, index) => (
                <div key={`${stock.ticker}-${index}`} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{stock.ticker}</span>
                  <span className="text-sm">{formatCurrency(stock.marketValue)}</span>
                </div>
              ))}
              {displayedValues.topPositions.length === 0 && (
                <p className="text-sm text-gray-500">No holdings yet</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

// Add display name for debugging
PortfolioSummaryCards.displayName = 'PortfolioSummaryCards';

export { PortfolioSummaryCards };