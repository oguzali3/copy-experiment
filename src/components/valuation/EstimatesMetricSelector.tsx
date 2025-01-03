import { Button } from "@/components/ui/button";

interface EstimatesMetricSelectorProps {
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
}

export const EstimatesMetricSelector = ({
  selectedMetric,
  onMetricChange,
}: EstimatesMetricSelectorProps) => {
  const metrics = [
    { id: "revenue", label: "Revenue" },
    { id: "eps", label: "EPS" },
    { id: "ebitda", label: "EBITDA" },
    { id: "netIncome", label: "Net Income" },
  ];

  return (
    <div className="flex gap-2 mb-6">
      {metrics.map((metric) => (
        <Button
          key={metric.id}
          variant={selectedMetric === metric.id ? "default" : "outline"}
          onClick={() => onMetricChange(metric.id)}
        >
          {metric.label}
        </Button>
      ))}
    </div>
  );
};