import { supabase } from "@/integrations/supabase/client";
import { Stock } from "../types";

export const calculatePortfolioMetrics = (stocks: Stock[]) => {
  const totalValue = stocks.reduce((sum, stock) => sum + stock.marketValue, 0);
  
  const stocksWithPercentages = stocks.map(stock => ({
    ...stock,
    percentOfPortfolio: totalValue > 0 ? (stock.marketValue / totalValue) * 100 : 0
  }));

  return {
    totalValue,
    stocksWithPercentages
  };
};

export const updatePortfolioStock = async (portfolioId: string, stock: Stock, existingStock: any) => {
  const { data, error } = await supabase
    .from('portfolio_stocks')
    .update({
      shares: stock.shares,
      avg_price: stock.avgPrice,
      current_price: stock.currentPrice,
      market_value: stock.marketValue,
      percent_of_portfolio: stock.percentOfPortfolio,
      gain_loss: stock.gainLoss,
      gain_loss_percent: stock.gainLossPercent
    })
    .eq('portfolio_id', portfolioId)
    .eq('ticker', stock.ticker);

  if (error) {
    console.error('Error updating portfolio stock:', error);
    throw error;
  }

  return data;
};