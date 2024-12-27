import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { EstimatesTable, estimatesData } from "./EstimatesTable";

interface EstimatesChartProps {
  ticker?: string;
}

const metrics = [
  { id: "revenue", label: "Revenue" },
  { id: "eps", label: "EPS" },
  { id: "priceTargets", label: "Price Targets" },
  { id: "ebitda", label: "EBITDA" },
  { id: "ebit", label: "EBIT" },
  { id: "freeCashFlow", label: "Free Cash Flow" },
  { id: "navShare", label: "NAV/Share" },
  { id: "bookValue", label: "Book Value/Share" },
  { id: "capex", label: "CapEx" },
];

const formatters = {
  revenue: (value: number) => `$${(value / 1000).toFixed(2)}K`,
  eps: (value: number) => `$${value.toFixed(2)}`,
  default: (value: number) => value.toString(),
};

export const EstimatesChart = ({ ticker }: EstimatesChartProps) => {
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const [timeframe, setTimeframe] = useState("annual");

  const handleDownload = () => {
    console.log("Downloading data...");
  };

  // Transform estimates data for the chart
  const chartData = estimatesData[selectedMetric as keyof typeof estimatesData]?.map(
    (item) => ({
      period: item.period,
      value: item.actual || item.mean,
      isEstimate: item.period.includes("(E)"),
    })
  );

  // Create segments for the line
  const segments = chartData?.map((item, index) => ({
    ...item,
    // An item should be dashed if it's an estimate OR if it comes after the last actual data point
    isDashed: item.isEstimate || (index > 0 && chartData[index - 1].isEstimate),
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-6 border rounded-xl p-6">
        {/* Metrics Navigation */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          {metrics.map((metric) => (
            <Button
              key={metric.id}
              variant={selectedMetric === metric.id ? "default" : "ghost"}
              onClick={() => setSelectedMetric(metric.id)}
              className={`whitespace-nowrap ${
                selectedMetric === metric.id
                  ? "bg-primary hover:bg-primary/90"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {metric.label}
            </Button>
          ))}
        </div>

        {/* Time Frame and Display Options */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-primary"
              />
              <span className="text-gray-600">% Chg.</span>
            </label>
            <div className="flex gap-2">
              {["K", "M", "B"].map((unit) => (
                <Button
                  key={unit}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-900"
                >
                  {unit}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={timeframe === "annual" ? "default" : "ghost"}
              onClick={() => setTimeframe("annual")}
              className={timeframe === "annual" ? "bg-primary hover:bg-primary/90" : ""}
            >
              Annual
            </Button>
            <Button
              variant={timeframe === "quarterly" ? "default" : "ghost"}
              onClick={() => setTimeframe("quarterly")}
              className={timeframe === "quarterly" ? "bg-primary hover:bg-primary/90" : ""}
            >
              Quarterly
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="text-primary hover:text-primary/90"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={segments}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                dataKey="period"
                stroke="#6B7280"
                tick={{ fill: "#374151" }}
              />
              <YAxis
                stroke="#6B7280"
                tick={{ fill: "#374151" }}
                tickFormatter={(value) =>
                  (formatters[selectedMetric as keyof typeof formatters] ||
                    formatters.default)(value)
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  color: "#111827",
                }}
                formatter={(value: number) =>
                  (formatters[selectedMetric as keyof typeof formatters] ||
                    formatters.default)(value)
                }
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                connectNulls
                strokeDasharray={(props: any) => props.payload.isDashed ? "5 5" : "0"}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Estimates Table */}
      <EstimatesTable metric={selectedMetric} />
    </div>
  );
};
