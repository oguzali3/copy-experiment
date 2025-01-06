import { supabase } from "@/integrations/supabase/client";
import { fetchFinancialData } from "@/utils/financialApi";
import { Portfolio, Stock } from "./types";
import { toast } from "sonner";

export const updateStockPrices = async (stocks: Stock[]): Promise<Stock[]> => {
  const updatedStocks = await Promise.all(
    stocks.map(async (stock) => {
      try {
        const quoteData = await fetchFinancialData('quote', stock.ticker);
        if (!quoteData || !quoteData[0]?.price) {
          console.error(`No price data received for ${stock.ticker}`);
          return stock;
        }
        
        const currentPrice = quoteData[0].price;
        const marketValue = currentPrice * stock.shares;
        const gainLoss = marketValue - (stock.shares * stock.avgPrice);
        const gainLossPercent = ((currentPrice - stock.avgPrice) / stock.avgPrice) * 100;

        return {
          ...stock,
          currentPrice,
          marketValue,
          gainLoss,
          gainLossPercent,
        };
      } catch (error) {
        console.error(`Error fetching price for ${stock.ticker}:`, error);
        toast.error(`Failed to fetch current price for ${stock.ticker}`);
        return stock;
      }
    })
  );

  // Recalculate percentOfPortfolio based on new market values
  const totalValue = updatedStocks.reduce((sum, stock) => sum + stock.marketValue, 0);
  return updatedStocks.map(stock => ({
    ...stock,
    percentOfPortfolio: (stock.marketValue / totalValue) * 100
  }));
};

export const fetchPortfolios = async () => {
  try {
    const { data: portfoliosData, error: portfoliosError } = await supabase
      .from('portfolios')
      .select(`
        id,
        name,
        total_value,
        portfolio_stocks (
          id,
          ticker,
          name,
          shares,
          avg_price,
          current_price,
          market_value,
          percent_of_portfolio,
          gain_loss,
          gain_loss_percent
        )
      `);

    if (portfoliosError) throw portfoliosError;

    if (!portfoliosData) return [];

    const formattedPortfolios: Portfolio[] = await Promise.all(
      portfoliosData.map(async p => {
        const stocks = (p.portfolio_stocks || []).map(s => ({
          ticker: s.ticker,
          name: s.name,
          shares: s.shares,
          avgPrice: s.avg_price,
          currentPrice: s.current_price || 0,
          marketValue: s.market_value || 0,
          percentOfPortfolio: s.percent_of_portfolio || 0,
          gainLoss: s.gain_loss || 0,
          gainLossPercent: s.gain_loss_percent || 0
        }));

        // Update current prices and calculations
        const updatedStocks = await updateStockPrices(stocks);
        const totalValue = updatedStocks.reduce((sum, stock) => sum + stock.marketValue, 0);

        // Update the portfolio in the database with new values
        await supabase
          .from('portfolios')
          .update({ total_value: totalValue })
          .eq('id', p.id);

        // Update stock values in the database
        await Promise.all(
          updatedStocks.map(stock => 
            supabase
              .from('portfolio_stocks')
              .update({
                current_price: stock.currentPrice,
                market_value: stock.marketValue,
                percent_of_portfolio: stock.percentOfPortfolio,
                gain_loss: stock.gainLoss,
                gain_loss_percent: stock.gainLossPercent
              })
              .eq('portfolio_id', p.id)
              .eq('ticker', stock.ticker)
          )
        );

        return {
          id: p.id,
          name: p.name,
          totalValue: totalValue,
          stocks: updatedStocks
        };
      })
    );

    return formattedPortfolios;
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    toast.error("Failed to fetch portfolios");
    return [];
  }
};