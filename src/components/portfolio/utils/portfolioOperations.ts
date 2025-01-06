import { supabase } from "@/integrations/supabase/client";
import { Stock } from "../types";

export const updatePortfolioStock = async (
  portfolioId: string,
  stock: Stock,
  existingStock: any,
  isTrimOperation: boolean
) => {
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
    // For add operations, calculate new total shares and weighted average price
    const totalShares = existingStock.shares + stock.shares;
    const totalCost = (existingStock.shares * existingStock.avg_price) + 
                     (stock.shares * stock.avgPrice);
    const newAvgPrice = totalCost / totalShares;
    
    return await supabase
      .from('portfolio_stocks')
      .update({
        shares: totalShares,
        avg_price: newAvgPrice,
        current_price: stock.currentPrice,
        market_value: totalShares * stock.currentPrice,
        percent_of_portfolio: stock.percentOfPortfolio,
        gain_loss: (totalShares * stock.currentPrice) - (totalShares * newAvgPrice),
        gain_loss_percent: ((stock.currentPrice - newAvgPrice) / newAvgPrice) * 100
      })
      .eq('portfolio_id', portfolioId)
      .eq('ticker', stock.ticker);
  }
};

export const calculatePortfolioMetrics = (stocks: Stock[]) => {
  const totalValue = stocks.reduce((sum, stock) => sum + stock.marketValue, 0);
  return {
    totalValue,
    stocksWithPercentages: stocks.map(stock => ({
      ...stock,
      percentOfPortfolio: (stock.marketValue / totalValue) * 100
    }))
  };
};