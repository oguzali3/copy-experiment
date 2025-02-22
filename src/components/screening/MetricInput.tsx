import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScreeningMetric } from "@/types/screening";

interface MetricInputProps {
  metric: ScreeningMetric;
  onRemove: (id: string) => void;
  onChange: (id: string, min: string, max: string) => void;
}

// In MetricInput.tsx

type FieldType = 'financial' | 'price' | 'other';

export const MetricInput = ({ metric, onRemove, onChange }: MetricInputProps) => {
  // Determine field type and appropriate unit
  const getFieldType = (fieldName: string): FieldType => {
    const name = fieldName.toLowerCase();
    
    if (name === 'price') return 'price';
    
    if (name.includes('revenue') ||
        name.includes('income') ||
        name.includes('cash flow') ||
        name.includes('assets') ||
        name.includes('liabilities') ||
        name.includes('equity') ||
        name.includes('cap') ||
        name.includes('ebitda') ||
        name.includes('debt') ||
        name.includes('cash') ||
        name.includes('volume')) {
      return 'financial';
    }
    
    return 'other';
  };

  const getDefaultUnit = (type: FieldType): string => {
    switch (type) {
      case 'financial':
        return '1000000'; // Default to millions for financial metrics
      default:
        return '1';
    }
  };

  const fieldType = useMemo(() => getFieldType(metric.name), [metric.name]);
  const [unit, setUnit] = useState(() => getDefaultUnit(fieldType));
  const shouldShowUnits = fieldType === 'financial';
  const isPrice = fieldType === 'price';

  const formatValue = (value: string, unit: string): string => {
    if (!value) return '';
    const numValue = Number(value);
    if (isNaN(numValue)) return '';
    return String(numValue / Number(unit));
  };

  const handleMinChange = (value: string) => {
    let numericValue = '';
    if (value !== '') {
      const baseValue = Number(value);
      if (!isNaN(baseValue)) {
        numericValue = String(baseValue * Number(unit));
      }
    }
    onChange(metric.id, numericValue, metric.max || '');
  };

  const handleMaxChange = (value: string) => {
    let numericValue = '';
    if (value !== '') {
      const baseValue = Number(value);
      if (!isNaN(baseValue)) {
        numericValue = String(baseValue * Number(unit));
      }
    }
    onChange(metric.id, metric.min || '', numericValue);
  };

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
        <div className="flex-1">
          <Label>Min</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="Min value"
                value={formatValue(metric.min, unit)}
                onChange={(e) => handleMinChange(e.target.value)}
                className={isPrice || shouldShowUnits ? "pl-8" : ""}
              />
              {(shouldShowUnits || isPrice) && (
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1">
          <Label>Max</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="Max value"
                value={formatValue(metric.max, unit)}
                onChange={(e) => handleMaxChange(e.target.value)}
                className={isPrice || shouldShowUnits ? "pl-8" : ""}
              />
              {(shouldShowUnits || isPrice) && (
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {shouldShowUnits && (
          <div className="flex flex-col justify-end">
            <Label>&nbsp;</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Unit</SelectItem>
                <SelectItem value="1000">K</SelectItem>
                <SelectItem value="1000000">M</SelectItem>
                <SelectItem value="1000000000">B</SelectItem>
                <SelectItem value="1000000000000">T</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </Card>
  );
};