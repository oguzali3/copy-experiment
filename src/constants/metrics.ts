// src/constants/metrics.ts
import { COMPANY_PROFILE_COLUMNS } from './columns';

// Helper function to format column name for display
const formatColumnName = (column: string): string => {
  return column
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Base metrics configuration
const BASE_METRICS = [
  {
    category: "Market Data",
    metrics: [
      {
        id: "price",
        name: "Price",
        description: "Current stock price",
        field: "price"
      },
      {
        id: "market_cap",
        name: "Market Cap",
        description: "Total market value of company's shares",
        field: "market_cap"
      },
      {
        id: "beta",
        name: "Beta",
        description: "Stock's volatility compared to the market",
        field: "beta"
      },
      {
        id: "volume",
        name: "Volume",
        description: "Trading volume",
        field: "volume"
      },
      {
        id: "average_volume",
        name: "Average Volume",
        description: "Average trading volume",
        field: "average_volume"
      }
    ]
  },
  {
    category: "Performance",
    metrics: [
      {
        id: "change",
        name: "Change",
        description: "Price change",
        field: "change"
      },
      {
        id: "change_percentage",
        name: "Change %",
        description: "Price change percentage",
        field: "change_percentage"
      },
      {
        id: "range",
        name: "Range",
        description: "Trading range",
        field: "range"
      }
    ]
  },
  {
    category: "Dividends",
    metrics: [
      {
        id: "last_dividend",
        name: "Last Dividend",
        description: "Most recent dividend payment",
        field: "last_dividend"
      }
    ]
  }
];

// Get all currently configured metric fields
const configuredFields = new Set(
  BASE_METRICS.flatMap(category => 
    category.metrics.map(metric => metric.field)
  )
);

// Create metrics for remaining columns
const remainingColumns = COMPANY_PROFILE_COLUMNS.filter(
  column => !configuredFields.has(column)
);

const additionalMetrics = {
  category: "Other Columns",
  metrics: remainingColumns.map(column => ({
    id: column,
    name: formatColumnName(column),
    description: `Filter by ${formatColumnName(column).toLowerCase()}`,
    field: column
  }))
};

// Combine base metrics with additional columns
export const METRICS_CONFIG = [...BASE_METRICS];
if (additionalMetrics.metrics.length > 0) {
  METRICS_CONFIG.push(additionalMetrics);
}