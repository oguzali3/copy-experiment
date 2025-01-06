export type Stock = {
  ticker: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  percentOfPortfolio: number;
  gainLoss: number;
  gainLossPercent: number;
};

export type Portfolio = {
  id: string;
  name: string;
  stocks: Stock[];
  totalValue: number;
};