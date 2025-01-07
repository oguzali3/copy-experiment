import { supabase } from "@/integrations/supabase/client";
import { Portfolio, Stock } from "../types";
import { toast } from "sonner";

export const updatePortfolio = async (updatedPortfolio: Portfolio) => {
  try {
    await updatePortfolioDetails(updatedPortfolio);
    const currentStocks = await fetchCurrentStocks(updatedPortfolio.id);
    const currentStocksMap = new Map(currentStocks?.map(s => [s.ticker, s]));

    for (const stock of updatedPortfolio.stocks) {
      const existingStock = currentStocksMap.get(stock.ticker);
      
      if (existingStock) {
        await handleExistingStock(updatedPortfolio, stock, existingStock);
      } else {
        await insertNewStock(updatedPortfolio, stock);
      }
    }

    await removeDeletedStocks(updatedPortfolio, currentStocksMap);
    return true;
  } catch (error) {
    console.error('Error updating portfolio:', error);
    throw error;
  }
};

const updatePortfolioDetails = async (portfolio: Portfolio) => {
  await supabase
    .from('portfolios')
    .update({
      name: portfolio.name,
      total_value: portfolio.totalValue
    })
    .eq('id', portfolio.id);
};

const fetchCurrentStocks = async (portfolioId: string) => {
  const { data } = await supabase
    .from('portfolio_stocks')
    .select('*')
    .eq('portfolio_id', portfolioId);
  return data;
};

const handleExistingStock = async (portfolio: Portfolio, stock: Stock, existingStock: any) => {
  if (stock.shares === existingStock.shares) {
    return;
  }

  if (stock.shares < existingStock.shares) {
    await handleStockTrim(portfolio, stock, existingStock);
  } else {
    await handleStockAdd(portfolio, stock, existingStock);
  }
};

const handleStockTrim = async (portfolio: Portfolio, stock: Stock, existingStock: any) => {
  await supabase
    .from('portfolio_stocks')
    .update({
      shares: stock.shares,
      current_price: stock.currentPrice,
      market_value: stock.shares * stock.currentPrice,
      percent_of_portfolio: stock.percentOfPortfolio,
      gain_loss: (stock.shares * stock.currentPrice) - (stock.shares * existingStock.avg_price),
      gain_loss_percent: ((stock.currentPrice - existingStock.avg_price) / existingStock.avg_price) * 100
    })
    .eq('portfolio_id', portfolio.id)
    .eq('ticker', stock.ticker);
};

const handleStockAdd = async (portfolio: Portfolio, stock: Stock, existingStock: any) => {
  const totalShares = existingStock.shares + stock.shares;
  const existingCost = existingStock.shares * existingStock.avg_price;
  const additionalCost = stock.shares * stock.avgPrice;
  const totalCost = existingCost + additionalCost;
  const newAvgPrice = totalCost / totalShares;
  const marketValue = totalShares * stock.currentPrice;
  const gainLoss = marketValue - totalCost;
  const gainLossPercent = ((stock.currentPrice - newAvgPrice) / newAvgPrice) * 100;

  await supabase
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
    .eq('portfolio_id', portfolio.id)
    .eq('ticker', stock.ticker);
};

const insertNewStock = async (portfolio: Portfolio, stock: Stock) => {
  await supabase
    .from('portfolio_stocks')
    .insert({
      portfolio_id: portfolio.id,
      ticker: stock.ticker,
      name: stock.name,
      shares: stock.shares,
      avg_price: stock.avgPrice,
      current_price: stock.currentPrice,
      market_value: stock.marketValue,
      percent_of_portfolio: stock.percentOfPortfolio,
      gain_loss: stock.gainLoss,
      gain_loss_percent: stock.gainLossPercent
    });
};

const removeDeletedStocks = async (portfolio: Portfolio, currentStocksMap: Map<string, any>) => {
  const updatedTickers = new Set(portfolio.stocks.map(s => s.ticker));
  const tickersToDelete = [...currentStocksMap.keys()].filter(ticker => !updatedTickers.has(ticker));
  
  if (tickersToDelete.length > 0) {
    await supabase
      .from('portfolio_stocks')
      .delete()
      .eq('portfolio_id', portfolio.id)
      .in('ticker', tickersToDelete);
  }
};