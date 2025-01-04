import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Portfolio, Stock } from '../PortfolioContent';
import { toast } from 'sonner';

export const usePortfolioData = (portfolioId: string) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPortfolioData = async () => {
    try {
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', portfolioId)
        .maybeSingle();

      if (portfolioError) throw portfolioError;
      if (!portfolioData) {
        toast.error('Portfolio not found');
        return;
      }

      const { data: stocksData, error: stocksError } = await supabase
        .from('portfolio_stocks')
        .select('*')
        .eq('portfolio_id', portfolioId);

      if (stocksError) throw stocksError;

      // Transform database model to frontend model
      const stocks: Stock[] = stocksData?.map(stock => ({
        ticker: stock.ticker,
        name: stock.name,
        shares: Number(stock.shares),
        avgPrice: Number(stock.avg_price),
        currentPrice: Number(stock.current_price),
        marketValue: Number(stock.market_value),
        percentOfPortfolio: Number(stock.percent_of_portfolio),
        gainLoss: Number(stock.gain_loss),
        gainLossPercent: Number(stock.gain_loss_percent)
      })) || [];

      setPortfolio({
        id: portfolioData.id,
        name: portfolioData.name,
        stocks,
        totalValue: Number(portfolioData.total_value)
      });
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      toast.error('Failed to load portfolio data');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePortfolio = async (updatedPortfolio: Portfolio) => {
    try {
      const { error: portfolioError } = await supabase
        .from('portfolios')
        .update({
          name: updatedPortfolio.name,
          total_value: updatedPortfolio.totalValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', portfolioId);

      if (portfolioError) throw portfolioError;

      // Update stocks
      for (const stock of updatedPortfolio.stocks) {
        const { error: stockError } = await supabase
          .from('portfolio_stocks')
          .upsert({
            portfolio_id: portfolioId,
            ticker: stock.ticker,
            name: stock.name,
            shares: stock.shares,
            avg_price: stock.avgPrice,
            current_price: stock.currentPrice,
            market_value: stock.marketValue,
            percent_of_portfolio: stock.percentOfPortfolio,
            gain_loss: stock.gainLoss,
            gain_loss_percent: stock.gainLossPercent,
            updated_at: new Date().toISOString()
          });

        if (stockError) throw stockError;
      }

      setPortfolio(updatedPortfolio);
      toast.success('Portfolio updated successfully');
    } catch (error) {
      console.error('Error updating portfolio:', error);
      toast.error('Failed to update portfolio');
    }
  };

  useEffect(() => {
    if (portfolioId) {
      fetchPortfolioData();
    }
  }, [portfolioId]);

  return {
    portfolio,
    isLoading,
    updatePortfolio,
    refreshPortfolio: fetchPortfolioData
  };
};