import React from "react";
import { Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MetricSettingsPopoverProps {
  metric: {
    id: string;
    name: string;
  };
  settings: Record<string, {
    average?: boolean;
    median?: boolean;
    min?: boolean;
    max?: boolean;
  }>;
  onSettingChange: (metricId: string, setting: string, value: boolean) => void;
}

export const MetricSettingsPopover: React.FC<MetricSettingsPopoverProps> = ({ 
  metric, 
  settings, 
  onSettingChange 
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          title="Metric Settings"
        >
          <Cog size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">{metric.name} - Statistics</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Checkbox 
                id={`avg-${metric.id}`} 
                checked={settings[metric.id]?.average || false} 
                onCheckedChange={(checked) => 
                  onSettingChange(metric.id, 'average', !!checked)
                }
              />
              <Label htmlFor={`avg-${metric.id}`} className="text-sm">Show Average</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id={`median-${metric.id}`} 
                checked={settings[metric.id]?.median || false} 
                onCheckedChange={(checked) => 
                  onSettingChange(metric.id, 'median', !!checked)
                }
              />
              <Label htmlFor={`median-${metric.id}`} className="text-sm">Show Median</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id={`min-${metric.id}`} 
                checked={settings[metric.id]?.min || false} 
                onCheckedChange={(checked) => 
                  onSettingChange(metric.id, 'min', !!checked)
                }
              />
              <Label htmlFor={`min-${metric.id}`} className="text-sm">Show Minimum</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id={`max-${metric.id}`} 
                checked={settings[metric.id]?.max || false} 
                onCheckedChange={(checked) => 
                  onSettingChange(metric.id, 'max', !!checked)
                }
              />
              <Label htmlFor={`max-${metric.id}`} className="text-sm">Show Maximum</Label>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};