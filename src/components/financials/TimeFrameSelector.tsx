import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface TimeFrameSelectorProps {
  timeFrame: "annual" | "quarterly" | "ttm";
  onTimeFrameChange: (value: "annual" | "quarterly" | "ttm") => void;
}

export const TimeFrameSelector = ({ timeFrame, onTimeFrameChange }: TimeFrameSelectorProps) => {
  return (
    <RadioGroup
      value={timeFrame}
      onValueChange={(value) => onTimeFrameChange(value as "annual" | "quarterly" | "ttm")}
      className="flex space-x-4"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="annual" id="annual" />
        <Label htmlFor="annual">Annual</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="quarterly" id="quarterly" />
        <Label htmlFor="quarterly">Quarterly</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="ttm" id="ttm" />
        <Label htmlFor="ttm">TTM</Label>
      </div>
    </RadioGroup>
  );
};