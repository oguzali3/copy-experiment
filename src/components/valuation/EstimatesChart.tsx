import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

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

// Mock data - in a real app, this would come from an API
const estimatesData = [
  { year: "2023", value: 383285, min: 380000, max: 385000 },
  { year: "2024", value: 395000, min: 390000, max: 400000 },
  { year: "2025", value: 410000, min: 400000, max: 420000 },
  { year: "2026", value: 425000, min: 415000, max: 435000 },
];

const formatters = {
  revenue: (value: number) => `$${(value / 1000).toFixed(2)}K`,
  eps: (value: number) => `$${value.toFixed(2)}`,
  default: (value: number) => value.toString(), // Convert number to string
};

export const EstimatesChart = ({ ticker }: EstimatesChartProps) => {
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const [timeframe, setTimeframe] = useState("annual");

  const handleDownload = () => {
    // Implement download functionality
    console.log("Downloading data...");
  };

  return (
    <div className="space-y-6 bg-[#191d25] p-6 rounded-xl">
      {/* Metrics Navigation */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {metrics.map((metric) => (
          <Button
            key={metric.id}
            variant={selectedMetric === metric.id ? "default" : "ghost"}
            onClick={() => setSelectedMetric(metric.id)}
            className={`whitespace-nowrap ${
              selectedMetric === metric.id
                ? "bg-emerald-500 hover:bg-emerald-600"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
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
              className="form-checkbox h-4 w-4 text-emerald-500"
            />
            <span className="text-gray-300">% Chg.</span>
          </label>
          <div className="flex gap-2">
            {["K", "M", "B"].map((unit) => (
              <Button
                key={unit}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-gray-800"
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
            className={timeframe === "annual" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
          >
            Annual
          </Button>
          <Button
            variant={timeframe === "quarterly" ? "default" : "ghost"}
            onClick={() => setTimeframe("quarterly")}
            className={timeframe === "quarterly" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
          >
            Quarterly
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            className="text-emerald-500 hover:text-emerald-600"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={estimatesData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis
              dataKey="year"
              stroke="#6B7280"
              tick={{ fill: "#9CA3AF" }}
            />
            <YAxis
              stroke="#6B7280"
              tick={{ fill: "#9CA3AF" }}
              tickFormatter={(value) =>
                (formatters[selectedMetric as keyof typeof formatters] ||
                  formatters.default)(value)
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "none",
                borderRadius: "0.5rem",
                color: "#F3F4F6",
              }}
              formatter={(value: number) =>
                (formatters[selectedMetric as keyof typeof formatters] ||
                  formatters.default)(value)
              }
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="min"
              stroke="#6B7280"
              strokeDasharray="3 3"
              strokeWidth={1}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="max"
              stroke="#6B7280"
              strokeDasharray="3 3"
              strokeWidth={1}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};