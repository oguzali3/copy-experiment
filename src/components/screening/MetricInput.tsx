import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { ScreeningMetric } from "@/types/screening";

interface MetricInputProps {
  metric: ScreeningMetric;
  onRemove: (id: string) => void;
  onChange: (id: string, min: string, max: string) => void;
}

export const MetricInput = ({ metric, onRemove, onChange }: MetricInputProps) => {
  const showMillionLabel = metric.name.toLowerCase().includes('revenue') || 
                          metric.name.toLowerCase().includes('income') ||
                          metric.name.toLowerCase().includes('cash flow') ||
                          metric.name.toLowerCase().includes('assets') ||
                          metric.name.toLowerCase().includes('liabilities') ||
                          metric.name.toLowerCase().includes('equity');

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">{metric.name}</span>
        <X
          className="h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500"
          onClick={() => onRemove(metric.id)}
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Label>Min</Label>
          {showMillionLabel && (
            <span className="absolute left-3 top-[34px] text-gray-500">M</span>
          )}
          <Input
            type="number"
            placeholder="Min value"
            value={metric.min}
            onChange={(e) => onChange(metric.id, e.target.value, metric.max || '')}
            className={showMillionLabel ? "pl-8" : ""}
          />
        </div>
        <div className="flex-1 relative">
          <Label>Max</Label>
          {showMillionLabel && (
            <span className="absolute left-3 top-[34px] text-gray-500">M</span>
          )}
          <Input
            type="number"
            placeholder="Max value"
            value={metric.max}
            onChange={(e) => onChange(metric.id, metric.min || '', e.target.value)}
            className={showMillionLabel ? "pl-8" : ""}
          />
        </div>
      </div>
    </Card>
  );
};