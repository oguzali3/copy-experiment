import React, { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Stock } from "./types";
import { Button } from "@/components/ui/button";
import { RefreshCw, Filter, X } from "lucide-react";

interface PortfolioAllocationChartProps {
  stocks: Stock[];
  /**
   * Callback executed every time the excluded ticker list changes.
   * The parent component can then decide how to handle the update
   * (e.g. persist to `localStorage`, forward to API calls, etc.).
   */
  onExcludedStocksChange?: (excludedTickers: string[]) => void;
}

interface ChartDataItem {
  name: string; // ticker symbol used for the label
  value: number; // percentage weight in the (filtered) portfolio
  fullName: string; // company name for tooltip
  amount: number; // market value for tooltip
}

/**
 * A colour palette large enough for practical portfolios.  If the user
 * supplies more tickers than colours we cycle through the palette.
 * Tailwind colours are chosen for readability in both dark‑ and light‑mode.
 */
const COLORS = [
  "#2563eb", // Blue
  "#f97316", // Orange
  "#7c3aed", // Purple
  "#10b981", // Green
  "#ef4444", // Red
  "#06b6d4", // Cyan
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#14b8a6", // Teal
];

// Colour used for legend chip when the position is excluded
const GRAY = "#9CA3AF";

export const PortfolioAllocationChart = ({
  stocks,
  onExcludedStocksChange,
}: PortfolioAllocationChartProps) => {
  const [excludedTickers, setExcludedTickers] = useState<string[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  /* ---------------------------------------------------------------------- */
  /* Memoised helpers                                                        */
  /* ---------------------------------------------------------------------- */
  /**
   * Returns a stable colour for every ticker based on its first appearance
   * in the `stocks` prop.  This guarantees that colours do not jump around
   * when the user toggles exclusions.
   */
  const getColor = (ticker: string) => {
    const index = stocks.findIndex((s) => s.ticker === ticker);
    return COLORS[index % COLORS.length];
  };

  /**
   * Builds the dataset for the <Pie> component **after** exclusions have
   * been applied.
   */
  const chartData: ChartDataItem[] = useMemo(() => {
    // Filter out any stock that has been excluded *or* has a falsy value
    const included = stocks.filter((s) => {
      const numeric = typeof s.marketValue === "string" ? parseFloat(s.marketValue) : s.marketValue;
      return !excludedTickers.includes(s.ticker) && numeric > 0;
    });

    const total = included.reduce((sum, s) => {
      const mv = typeof s.marketValue === "string" ? parseFloat(s.marketValue) : s.marketValue;
      return sum + (isNaN(mv) ? 0 : mv);
    }, 0);

    if (total === 0) return [];

    return included.map((s) => {
      const mv = typeof s.marketValue === "string" ? parseFloat(s.marketValue) : s.marketValue;
      return {
        name: s.ticker,
        value: (mv / total) * 100,
        fullName: s.name,
        amount: mv,
      } as ChartDataItem;
    });
  }, [stocks, excludedTickers]);

  /* ---------------------------------------------------------------------- */
  /* Side‑effects                                                            */
  /* ---------------------------------------------------------------------- */
  // Notify parent about exclusion changes
  useEffect(() => {
    if (onExcludedStocksChange) onExcludedStocksChange(excludedTickers);
  }, [excludedTickers, onExcludedStocksChange]);

  /* ---------------------------------------------------------------------- */
  /* Event handlers                                                          */
  /* ---------------------------------------------------------------------- */
  const toggleExcludeTicker = (ticker: string) => {
    setExcludedTickers((prev) => {
      const next = prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker];
      return next;
    });
  };

  const resetExclusions = () => setExcludedTickers([]);

  /* ---------------------------------------------------------------------- */
  /* Render helpers                                                          */
  /* ---------------------------------------------------------------------- */
  const LegendItem = ({ ticker }: { ticker: string }) => {
    const isExcluded = excludedTickers.includes(ticker);
    return (
      <button
        key={ticker}
        className={`flex items-center px-3 py-1.5 rounded-full transition-all ${
          isExcluded ? "bg-gray-200 text-gray-500" : "bg-gray-100 hover:bg-gray-200"
        }`}
        onClick={() => toggleExcludeTicker(ticker)}
        title={`Click to ${isExcluded ? "include" : "exclude"} ${ticker}`}
      >
        <div
          className="w-3 h-3 rounded-full mr-2"
          style={{ backgroundColor: isExcluded ? GRAY : getColor(ticker), opacity: isExcluded ? 0.3 : 1 }}
        />
        <span className={`font-medium ${isExcluded ? "line-through" : ""}`}>{ticker}</span>
        {isExcluded && <X className="h-3 w-3 ml-1 text-gray-500" />}
      </button>
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Component                                                               */
  /* ---------------------------------------------------------------------- */
  if (stocks.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>No allocation data to display</p>
          <p className="text-sm">Add positions with shares and prices to see allocation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header ----------------------------------------------------------- */}
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium">
          {excludedTickers.length > 0 ? (
            <span>
              Showing {stocks.length - excludedTickers.length} of {stocks.length} positions
            </span>
          ) : (
            <span>Showing all {stocks.length} positions</span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          {excludedTickers.length > 0 && (
            <Button variant="outline" size="sm" onClick={resetExclusions} className="text-xs flex items-center">
              <RefreshCw className="mr-1 h-3 w-3" />
              Reset Filters
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowFilterPanel((p) => !p)} className="text-xs flex items-center">
            <Filter className="mr-1 h-3 w-3" />
            Filters {excludedTickers.length > 0 && `(${excludedTickers.length})`}
          </Button>
        </div>
      </div>

      {/* Filter panel ------------------------------------------------------ */}
      {showFilterPanel && (
        <div className="bg-blue-50 p-4 rounded-lg mb-2 border border-blue-100">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">Excluded Positions ({excludedTickers.length})</h4>
            <Button variant="ghost" size="sm" onClick={() => setShowFilterPanel(false)} className="h-7 w-7 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {excludedTickers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {excludedTickers.map((ticker) => {
                const stock = stocks.find((s) => s.ticker === ticker);
                const mv = stock
                  ? typeof stock.marketValue === "string"
                    ? parseFloat(stock.marketValue)
                    : stock.marketValue
                  : 0;
                return (
                  <div key={ticker} className="flex items-center bg-white px-2 py-1 rounded border border-gray-200">
                    <span className="mr-1 font-medium">{ticker}</span>
                    <span className="text-sm text-gray-500">(${mv.toFixed(2)})</span>
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1 text-gray-500 hover:text-red-500" onClick={() => toggleExcludeTicker(ticker)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}

              <Button variant="outline" size="sm" onClick={resetExclusions} className="mt-2 text-xs bg-white">
                Clear All Filters
              </Button>
            </div>
          ) : (
            <p className="text-sm text-gray-600">No positions are currently excluded. Click on a ticker below to exclude it.</p>
          )}
        </div>
      )}

      {/* Pie chart --------------------------------------------------------- */}
      <div className="h-[300px] w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                labelLine={false}
                label={({ name, percent }) => {
                  if (percent < 0.05) return null; // hide tiny slices
                  return `${name} ${(percent * 100).toFixed(0)}%`;
                }}
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={getColor(entry.name)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: string, props: any) => {
                  if (!props || !props.payload) return [value, name];
                  const entry = props.payload as ChartDataItem;
                  const pct = typeof value === "number" ? value.toFixed(2) : value;
                  return [
                    `$${entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${pct}%)`,
                    entry.fullName,
                  ];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p>No allocation data to display</p>
              <p className="text-sm">All positions are excluded or have zero market value.</p>
              {excludedTickers.length > 0 && (
                <Button variant="outline" size="sm" onClick={resetExclusions} className="mt-2">
                  Reset Filters
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend rendered *below* the chart so that the payload from Recharts is not needed. */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {stocks.map((s) => (
          <LegendItem key={`legend-${s.ticker}`} ticker={s.ticker} />
        ))}
      </div>
    </div>
  );
};
