import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Stock, Portfolio } from '../PortfolioContent';

export const useMarketData = (portfolio: Portfolio, onUpdatePortfolio: (portfolio: Portfolio) => void) => {
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [updateAttempts, setUpdateAttempts] = useState(0);

  const fetchMarketData = async () => {
    if (portfolio.stocks.length === 0) return;
    
    setIsLoadingMarketData(true);
    try {
      const tickers = portfolio.stocks.map(stock => stock.ticker);
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { 
          endpoint: 'portfolio-operations',
          tickers 
        }
      });

      if (error) {
        console.error('Error fetching market data:', error);
        setUpdateAttempts(prev => prev + 1);
        if (updateAttempts >= 3) {
          toast.error('Unable to fetch market data. Please try again later.');
          setIsLoadingMarketData(false);
          return;
        }
        throw error;
      }

      const marketDataMap = data.reduce((acc: Record<string, any>, item: any) => {
        acc[item.ticker] = item;
        return acc;
      }, {});

      setLastUpdated(new Date());
      setUpdateAttempts(0);
      
      const updatedStocks = portfolio.stocks.map(stock => {
        const currentPrice = marketDataMap[stock.ticker]?.currentPrice || stock.currentPrice;
        const marketValue = currentPrice * stock.shares;
        const gainLoss = marketValue - (stock.avgPrice * stock.shares);
        const gainLossPercent = ((currentPrice - stock.avgPrice) / stock.avgPrice) * 100;

        return {
          ...stock,
          currentPrice,
          marketValue,
          gainLoss,
          gainLossPercent
        };
      });

      const totalValue = updatedStocks.reduce((sum, stock) => sum + stock.marketValue, 0);
      
      const stocksWithUpdatedPercentages = updatedStocks.map(stock => ({
        ...stock,
        percentOfPortfolio: (stock.marketValue / totalValue) * 100
      }));

      onUpdatePortfolio({
        ...portfolio,
        stocks: stocksWithUpdatedPercentages,
        totalValue
      });

    } catch (error) {
      console.error('Error fetching market data:', error);
      setUpdateAttempts(prev => prev + 1);
      if (updateAttempts >= 3) {
        toast.error('Unable to fetch market data. Please try again later.');
      }
    } finally {
      setIsLoadingMarketData(false);
    }
  };

  // Only fetch on initial mount
  useEffect(() => {
    fetchMarketData();
  }, [portfolio.stocks]); // Only re-fetch when stocks array changes

  return { isLoadingMarketData, lastUpdated, updateAttempts, refreshMarketData: fetchMarketData };
};