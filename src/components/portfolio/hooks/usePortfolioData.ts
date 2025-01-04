import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Portfolio } from '../PortfolioContent';
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
        .single();

      if (portfolioError) throw portfolioError;

      const { data: stocksData, error: stocksError } = await supabase
        .from('portfolio_stocks')
        .select('*')
        .eq('portfolio_id', portfolioId);

      if (stocksError) throw stocksError;

      setPortfolio({
        ...portfolioData,
        stocks: stocksData || []
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
    fetchPortfolioData();
  }, [portfolioId]);

  return {
    portfolio,
    isLoading,
    updatePortfolio,
    refreshPortfolio: fetchPortfolioData
  };
};