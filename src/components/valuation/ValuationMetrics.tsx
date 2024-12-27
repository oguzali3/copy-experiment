import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MetricChart } from "../financials/MetricChart";

interface ValuationMetric {
  name: string;
  trend: "up" | "down" | "neutral";
  historicalData: {
    [year: string]: string;
  };
}

const valuationMetrics: ValuationMetric[] = [
  { 
    name: "P/E Ratio", 
    trend: "up",
    historicalData: {
      "2019": "18.2x",
      "2020": "21.4x",
      "2021": "24.8x",
      "2022": "26.3x",
      "2023": "28.5x",
      "2024": "29.1x"
    }
  },
  { 
    name: "P/S Ratio", 
    trend: "down",
    historicalData: {
      "2019": "4.2x",
      "2020": "5.1x",
      "2021": "5.8x",
      "2022": "6.4x",
      "2023": "6.8x",
      "2024": "6.5x"
    }
  },
  { 
    name: "P/B Ratio", 
    trend: "up",
    historicalData: {
      "2019": "32.4x",
      "2020": "35.8x",
      "2021": "38.9x",
      "2022": "41.2x",
      "2023": "44.6x",
      "2024": "46.2x"
    }
  },
  { 
    name: "EV/EBITDA", 
    trend: "neutral",
    historicalData: {
      "2019": "15.6x",
      "2020": "17.2x",
      "2021": "18.9x",
      "2022": "20.1x",
      "2023": "21.3x",
      "2024": "21.5x"
    }
  },
  { 
    name: "PEG Ratio", 
    trend: "down",
    historicalData: {
      "2019": "1.4x",
      "2020": "1.6x",
      "2021": "1.8x",
      "2022": "2.0x",
      "2023": "2.1x",
      "2024": "1.9x"
    }
  }
];

// Mock data for the chart
const mockChartData = [
  {
    period: "Q1 2023",
    metrics: [
      { name: "P/E Ratio", value: 25.4 },
      { name: "P/S Ratio", value: 6.2 },
    ],
  },
  {
    period: "Q2 2023",
    metrics: [
      { name: "P/E Ratio", value: 26.8 },
      { name: "P/S Ratio", value: 6.5 },
    ],
  },
  {
    period: "Q3 2023",
    metrics: [
      { name: "P/E Ratio", value: 27.9 },
      { name: "P/S Ratio", value: 6.7 },
    ],
  },
  {
    period: "Q4 2023",
    metrics: [
      { name: "P/E Ratio", value: 28.5 },
      { name: "P/S Ratio", value: 6.8 },
    ],
  },
];

export const ValuationMetrics = () => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [timeframe, setTimeframe] = useState("quarterly");

  const handleMetricSelect = (metricName: string) => {
    if (selectedMetrics.includes(metricName)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== metricName));
    } else {
      setSelectedMetrics([...selectedMetrics, metricName]);
    }
  };

  return (
    <div className="space-y-6">
      {selectedMetrics.length > 0 && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {["1M", "3M", "6M", "1Y", "2Y", "5Y"].map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? "default" : "outline"}
                onClick={() => setTimeframe(period)}
                size="sm"
              >
                {period}
              </Button>
            ))}
          </div>
          <MetricChart
            data={mockChartData}
            metrics={selectedMetrics}
            chartType="line"
          />
        </div>
      )}

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead className="text-right">2019</TableHead>
              <TableHead className="text-right">2020</TableHead>
              <TableHead className="text-right">2021</TableHead>
              <TableHead className="text-right">2022</TableHead>
              <TableHead className="text-right">2023</TableHead>
              <TableHead className="text-right">2024</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {valuationMetrics.map((metric) => (
              <TableRow key={metric.name}>
                <TableCell className="font-medium">{metric.name}</TableCell>
                {["2019", "2020", "2021", "2022", "2023", "2024"].map((year) => (
                  <TableCell key={year} className="text-right">
                    {metric.historicalData[year]}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <Button
                    variant={selectedMetrics.includes(metric.name) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleMetricSelect(metric.name)}
                  >
                    {selectedMetrics.includes(metric.name) ? "Selected" : "Select"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};