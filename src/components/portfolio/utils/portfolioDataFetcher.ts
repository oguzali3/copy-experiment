import { supabase } from "@/integrations/supabase/client";
import { fetchFinancialData } from "@/utils/financialApi";
import { Stock, Portfolio } from "../types";
import { toast } from "sonner";
import { calculatePortfolioMetrics } from "./portfolioOperations";

const updateStockMetrics = async (stockId: string, metrics: any) => {
  await supabase
    .from('portfolio_stocks')
    .update({
      current_price: metrics.currentPrice,
      market_value: metrics.marketValue,
      gain_loss: metrics.gainLoss,
      gain_loss_percent: metrics.gainLossPercent
    })
    .eq('id', stockId);
};

const updatePortfolioValue = async (portfolioId: string, totalValue: number) => {
  await supabase
    .from('portfolios')
    .update({ total_value: totalValue })
    .eq('id', portfolioId);
};

const updateStocksPercentages = async (portfolioId: string, stocks: Stock[]) => {
  await Promise.all(stocks.map(stock =>
    supabase
      .from('portfolio_stocks')
      .update({ percent_of_portfolio: stock.percentOfPortfolio })
      .eq('portfolio_id', portfolioId)
      .eq('ticker', stock.ticker)
  ));
};

export const fetchPortfolioData = async () => {
  try {
    const { data, error } = await supabase
      .from("portfolios")
      .select("*, portfolio_stocks(*)")
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    if (!data) return null;

    const stocksPromises = (data.portfolio_stocks || []).map(async (stock: any) => {
      try {
        const quoteData = await fetchFinancialData('quote', stock.ticker);
        if (!quoteData || !quoteData[0]) {
          console.error(`No quote data received for ${stock.ticker}`);
          throw new Error(`Failed to fetch quote data for ${stock.ticker}`);
        }
        
        const currentPrice = quoteData[0]?.price || 0;
        const shares = Number(stock.shares);
        const avgPrice = Number(stock.avg_price);
        const marketValue = shares * currentPrice;
        const gainLoss = marketValue - (shares * avgPrice);
        const gainLossPercent = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;

        await updateStockMetrics(stock.id, {
          currentPrice,
          marketValue,
          gainLoss,
          gainLossPercent
        });

        return {
          ticker: stock.ticker,
          name: stock.name,
          shares,
          avgPrice,
          currentPrice,
          marketValue,
          percentOfPortfolio: 0, // Will be calculated later
          gainLoss,
          gainLossPercent
        };
      } catch (error) {
        console.error(`Error fetching price for ${stock.ticker}:`, error);
        toast.error(`Failed to fetch current price for ${stock.ticker}`);
        
        return {
          ticker: stock.ticker,
          name: stock.name,
          shares: Number(stock.shares),
          avgPrice: Number(stock.avg_price),
          currentPrice: Number(stock.current_price),
          marketValue: Number(stock.market_value),
          percentOfPortfolio: Number(stock.percent_of_portfolio),
          gainLoss: Number(stock.gain_loss),
          gainLossPercent: Number(stock.gain_loss_percent)
        };
      }
    });

    const stocks = await Promise.all(stocksPromises);
    const { totalValue, stocksWithPercentages } = calculatePortfolioMetrics(stocks);
    
    await updatePortfolioValue(data.id, totalValue);
    await updateStocksPercentages(data.id, stocksWithPercentages);

    return {
      id: data.id,
      name: data.name,
      stocks: stocksWithPercentages,
      totalValue
    };
  } catch (error) {
    console.error('Error in fetchPortfolioData:', error);
    throw error;
  }
};