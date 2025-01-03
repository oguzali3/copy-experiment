import { Search } from "lucide-react";
import { useState } from "react";

interface MetricsSearchProps {
  onMetricSelect: (metricId: string) => void;
}

const categories = [
  {
    name: "Income Statement",
    metrics: [
      { id: "revenue", name: "Revenue", description: "Total revenue" },
      { id: "grossProfit", name: "Gross Profit", description: "Revenue minus cost of goods sold" },
      { id: "operatingIncome", name: "Operating Income", description: "Profit from operations" },
      { id: "netIncome", name: "Net Income", description: "Total earnings" },
      { id: "eps", name: "EPS", description: "Earnings per share" },
      { id: "ebitda", name: "EBITDA", description: "Earnings before interest, taxes, depreciation, and amortization" }
    ]
  },
  {
    name: "Balance Sheet",
    metrics: [
      { id: "totalAssets", name: "Total Assets", description: "Sum of all assets" },
      { id: "totalLiabilities", name: "Total Liabilities", description: "Sum of all liabilities" },
      { id: "totalEquity", name: "Total Equity", description: "Net worth" },
      { id: "cashAndEquivalents", name: "Cash & Equivalents", description: "Liquid assets" },
      { id: "totalDebt", name: "Total Debt", description: "Sum of all debt" }
    ]
  },
  {
    name: "Cash Flow",
    metrics: [
      { id: "operatingCashFlow", name: "Operating Cash Flow", description: "Cash from operations" },
      { id: "investingCashFlow", name: "Investing Cash Flow", description: "Cash from investments" },
      { id: "financingCashFlow", name: "Financing Cash Flow", description: "Cash from financing" },
      { id: "freeCashFlow", name: "Free Cash Flow", description: "Operating cash flow minus capital expenditures" }
    ]
  },
  {
    name: "Key Ratios",
    metrics: [
      { id: "peRatio", name: "P/E Ratio", description: "Price to earnings ratio" },
      { id: "pbRatio", name: "P/B Ratio", description: "Price to book ratio" },
      { id: "debtToEquity", name: "Debt to Equity", description: "Total debt divided by equity" },
      { id: "currentRatio", name: "Current Ratio", description: "Current assets divided by current liabilities" },
      { id: "quickRatio", name: "Quick Ratio", description: "Liquid assets divided by current liabilities" }
    ]
  },
  {
    name: "Growth Metrics",
    metrics: [
      { id: "revenueGrowth", name: "Revenue Growth", description: "Year-over-year revenue growth" },
      { id: "netIncomeGrowth", name: "Net Income Growth", description: "Year-over-year net income growth" },
      { id: "epsgrowth", name: "EPS Growth", description: "Year-over-year EPS growth" },
      { id: "fcfGrowth", name: "FCF Growth", description: "Year-over-year free cash flow growth" }
    ]
  }
];

export const MetricsSearch = ({ onMetricSelect }: MetricsSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredCategories = categories.map(category => ({
    ...category,
    metrics: category.metrics.filter(metric =>
      metric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metric.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.metrics.length > 0);

  const handleSelect = (metricId: string) => {
    onMetricSelect(metricId);
    setSearchQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search metrics..."
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border max-h-[400px] overflow-y-auto z-50">
          {filteredCategories.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              No metrics found
            </div>
          ) : (
            <div>
              {filteredCategories.map((category) => (
                <div key={category.name}>
                  <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700">
                    {category.name}
                  </div>
                  {category.metrics.map((metric) => (
                    <div
                      key={metric.id}
                      onClick={() => handleSelect(metric.id)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">
                            {metric.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {metric.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};