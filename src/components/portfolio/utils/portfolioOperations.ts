import { supabase } from "@/integrations/supabase/client";
import { Stock } from "../types";

export const updatePortfolioStock = async (
  portfolioId: string,
  stock: Stock,
  existingStock: any,
  isTrimOperation: boolean
) => {
  try {
    if (isTrimOperation) {
      // For trim operations, use the new share count directly
      return await supabase
        .from('portfolio_stocks')
        .update({
          shares: stock.shares,
          current_price: stock.currentPrice,
          market_value: stock.shares * stock.currentPrice,
          percent_of_portfolio: stock.percentOfPortfolio,
          gain_loss: (stock.shares * stock.currentPrice) - (stock.shares * stock.avgPrice),
          gain_loss_percent: ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100
        })
        .eq('portfolio_id', portfolioId)
        .eq('ticker', stock.ticker);
    } else {
      // Adding shares logic
      const totalShares = existingStock.shares + stock.shares;
      const totalCost = (existingStock.shares * existingStock.avg_price) + 
                       (stock.shares * stock.avgPrice);
      const newAvgPrice = totalCost / totalShares;
      const marketValue = totalShares * stock.currentPrice;
      const gainLoss = marketValue - (totalShares * newAvgPrice);
      const gainLossPercent = ((stock.currentPrice - newAvgPrice) / newAvgPrice) * 100;

      return await supabase
        .from('portfolio_stocks')
        .update({
          shares: totalShares,
          avg_price: newAvgPrice,
          current_price: stock.currentPrice,
          market_value: marketValue,
          percent_of_portfolio: stock.percentOfPortfolio,
          gain_loss: gainLoss,
          gain_loss_percent: gainLossPercent
        })
        .eq('portfolio_id', portfolioId)
        .eq('ticker', stock.ticker);
    }
  } catch (error) {
    console.error('Error updating portfolio stock:', error);
    throw error;
  }
};

export const calculatePortfolioMetrics = (stocks: Stock[]) => {
  const totalValue = stocks.reduce((sum, stock) => sum + stock.marketValue, 0);
  
  const stocksWithPercentages = stocks.map(stock => ({
    ...stock,
    percentOfPortfolio: (stock.marketValue / totalValue) * 100
  }));

  return {
    totalValue,
    stocksWithPercentages
  };
};