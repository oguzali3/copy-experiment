import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { ScreeningMetric } from "@/types/screening";

interface MetricInputProps {
  metric: ScreeningMetric;
  onRemove: (id: string) => void;
  onChange: (id: string, min: string, max: string) => void;
}

export const MetricInput = ({ metric, onRemove, onChange }: MetricInputProps) => {
  const isBooleanMetric = ['isEtf', 'isFund', 'isActivelyTrading'].includes(metric.id);
  const isNumericMetric = ['marketCap', 'price', 'beta', 'volume', 'dividend'].includes(metric.id);
  
  const formatLabel = (value: string) => {
    if (metric.id === 'marketCap') {
      return `${parseFloat(value) / 1000000000}B`;
    }
    if (metric.id === 'volume') {
      return `${parseFloat(value) / 1000000}M`;
    }
    return value;
  };

  if (isBooleanMetric) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="font-medium">{metric.name}</div>
            <div className="text-sm text-gray-500">{metric.description}</div>
          </div>
          <div className="flex items-center gap-4">
            <Switch
              checked={metric.min === 'true'}
              onCheckedChange={(checked) => onChange(metric.id, checked.toString(), '')}
            />
            <X
              className="h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500"
              onClick={() => onRemove(metric.id)}
            />
          </div>
        </div>
      </Card>
    );
  }

  if (isNumericMetric) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="font-medium">{metric.name}</span>
            <p className="text-sm text-gray-500">{metric.description}</p>
          </div>
          <X
            className="h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500"
            onClick={() => onRemove(metric.id)}
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label>Min</Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="Min value"
                value={metric.min}
                onChange={(e) => onChange(metric.id, e.target.value, metric.max || '')}
                className="pr-16"
              />
              {metric.min && (
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">{formatLabel(metric.min)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <Label>Max</Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="Max value"
                value={metric.max}
                onChange={(e) => onChange(metric.id, metric.min || '', e.target.value)}
                className="pr-16"
              />
              {metric.max && (
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">{formatLabel(metric.max)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="font-medium">{metric.name}</span>
          <p className="text-sm text-gray-500">{metric.description}</p>
        </div>
        <X
          className="h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500"
          onClick={() => onRemove(metric.id)}
        />
      </div>
      <Input
        type="text"
        placeholder={`Enter ${metric.name.toLowerCase()}`}
        value={metric.min || ''}
        onChange={(e) => onChange(metric.id, e.target.value, '')}
      />
    </Card>
  );
};