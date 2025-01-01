import { INCOME_STATEMENT_METRICS } from "./metricDefinitions";
import { calculateMetricValue } from "./metricDefinitions";

export const transformFinancialData = (data: any, ticker: string) => {
  const transformedAnnual = data.map((item: any) => ({
    period: new Date(item.date).getFullYear().toString(),
    revenue: item.revenue?.toString() || "0",
    revenueGrowth: item.revenueGrowth?.toString() || "0",
    costOfRevenue: item.costOfRevenue?.toString() || "0",
    grossProfit: item.grossProfit?.toString() || "0",
    operatingExpenses: item.operatingExpenses?.toString() || "0",
    operatingIncome: item.operatingIncome?.toString() || "0",
    netIncome: item.netIncome?.toString() || "0",
    ebitda: item.ebitda?.toString() || "0",
  }));

  return transformedAnnual;
};

export const calculateTTM = (ttmData: any[]) => {
  return ttmData.reduce((acc: any, quarter: any) => {
    Object.keys(quarter).forEach(key => {
      if (typeof quarter[key] === 'number') {
        acc[key] = (acc[key] || 0) + quarter[key];
      }
    });
    return acc;
  }, {});
};

export const transformTTMData = (ttm: any) => ({
  period: 'TTM',
  revenue: ttm.revenue?.toString() || "0",
  revenueGrowth: ttm.revenueGrowth?.toString() || "0",
  costOfRevenue: ttm.costOfRevenue?.toString() || "0",
  grossProfit: ttm.grossProfit?.toString() || "0",
  operatingExpenses: ttm.operatingExpenses?.toString() || "0",
  operatingIncome: ttm.operatingIncome?.toString() || "0",
  netIncome: ttm.netIncome?.toString() || "0",
  ebitda: ttm.ebitda?.toString() || "0",
});

export const getMetricChartData = (
  selectedMetrics: string[],
  financialData: any,
  ticker: string,
  sliderValue: number[],
  timePeriods: string[]
) => {
  if (!selectedMetrics.length || !financialData) {
    console.log('No metrics selected or no data available');
    return [];
  }

  const annualData = financialData[ticker]?.annual || [];
  const ttmData = financialData[ticker]?.ttm || [];

  if (!annualData.length) {
    console.log('No data available');
    return [];
  }

  // Filter years based on slider
  const startYear = parseInt(timePeriods[sliderValue[0]]);
  const endYear = parseInt(timePeriods[sliderValue[1]]);
  
  const filteredData = annualData.filter(item => {
    const year = parseInt(item.period);
    return year >= startYear && year <= endYear;
  });

  // Transform data for chart
  const chartData = filteredData.map((item, index) => {
    const point: Record<string, any> = { period: item.period };
    const previousItem = filteredData[index + 1];
    
    selectedMetrics.forEach(metric => {
      const metricDef = INCOME_STATEMENT_METRICS.find(m => m.id === metric);
      if (metricDef) {
        point[metric] = calculateMetricValue(metricDef, item, previousItem);
      }
    });
    
    return point;
  });

  // Add TTM data if available and if the end year includes the most recent year
  if (ttmData.length > 0 && endYear >= parseInt(annualData[0].period)) {
    const ttmPoint: Record<string, any> = { period: 'TTM' };
    const previousPeriod = filteredData[0];
    
    selectedMetrics.forEach(metric => {
      const metricDef = INCOME_STATEMENT_METRICS.find(m => m.id === metric);
      if (metricDef) {
        ttmPoint[metric] = calculateMetricValue(metricDef, ttmData[0], previousPeriod);
      }
    });
    
    chartData.push(ttmPoint);
  }

  return chartData;
};