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
  value: string;
  description: string;
  trend: "up" | "down" | "neutral";
}

const valuationMetrics: ValuationMetric[] = [
  { 
    name: "P/E Ratio", 
    value: "28.5x", 
    description: "Price to earnings ratio",
    trend: "up"
  },
  { 
    name: "P/S Ratio", 
    value: "6.8x", 
    description: "Price to sales ratio",
    trend: "down"
  },
  { 
    name: "P/B Ratio", 
    value: "44.6x", 
    description: "Price to book ratio",
    trend: "up"
  },
  { 
    name: "EV/EBITDA", 
    value: "21.3x", 
    description: "Enterprise value to EBITDA",
    trend: "neutral"
  },
  { 
    name: "PEG Ratio", 
    value: "2.1x", 
    description: "Price/earnings to growth ratio",
    trend: "down"
  }
];

// Mock data for the chart
const mockChartData = [
  {
    period: "Q1 2023",
    metrics: [
      { name: "P/E Ratio", value: 25.4 },
      { name: "P/S Ratio", value: 6.2 },
      { name: "P/B Ratio", value: 42.1 },
      { name: "EV/EBITDA", value: 19.8 },
      { name: "PEG Ratio", value: 1.9 },
    ],
  },
  {
    period: "Q2 2023",
    metrics: [
      { name: "P/E Ratio", value: 26.8 },
      { name: "P/S Ratio", value: 6.5 },
      { name: "P/B Ratio", value: 43.2 },
      { name: "EV/EBITDA", value: 20.5 },
      { name: "PEG Ratio", value: 2.0 },
    ],
  },
  {
    period: "Q3 2023",
    metrics: [
      { name: "P/E Ratio", value: 27.9 },
      { name: "P/S Ratio", value: 6.7 },
      { name: "P/B Ratio", value: 44.1 },
      { name: "EV/EBITDA", value: 21.0 },
      { name: "PEG Ratio", value: 2.05 },
    ],
  },
  {
    period: "Q4 2023",
    metrics: [
      { name: "P/E Ratio", value: 28.5 },
      { name: "P/S Ratio", value: 6.8 },
      { name: "P/B Ratio", value: 44.6 },
      { name: "EV/EBITDA", value: 21.3 },
      { name: "PEG Ratio", value: 2.1 },
    ],
  },
];

export const ValuationMetrics = () => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
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
          <div className="flex justify-between items-center">
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
            <div className="flex gap-2">
              <Button
                variant={chartType === 'line' ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType('line')}
              >
                Line
              </Button>
              <Button
                variant={chartType === 'bar' ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType('bar')}
              >
                Bar
              </Button>
            </div>
          </div>
          <MetricChart
            data={mockChartData}
            metrics={selectedMetrics}
            chartType={chartType}
          />
        </div>
      )}
      
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {valuationMetrics.map((metric) => (
              <TableRow key={metric.name}>
                <TableCell className="font-medium">{metric.name}</TableCell>
                <TableCell>{metric.value}</TableCell>
                <TableCell className="text-muted-foreground">
                  {metric.description}
                </TableCell>
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