import React from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { ScreeningSearch } from "./ScreeningSearch";

interface FilterSectionProps {
  title: string;
  selected: string[];
  onSelect: (items: string[]) => void;
  excludeEnabled: boolean;
  onExcludeChange: (value: boolean) => void;
  type: "countries" | "industries" | "exchanges";
}

export const FilterSection = ({
  title,
  selected,
  onSelect,
  excludeEnabled,
  onExcludeChange,
  type,
}: FilterSectionProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <Switch
            id={`exclude-${type}`}
            checked={excludeEnabled}
            onCheckedChange={onExcludeChange}
          />
          <Label htmlFor={`exclude-${type}`}>Exclude {title}</Label>
        </div>
      </div>
      <ScreeningSearch
        type={type}
        selected={selected}
        onSelect={onSelect}
      />
      {selected.length > 0 && (
        <ScrollArea className="h-12 mt-2">
          <div className="flex gap-2 flex-wrap">
            {selected.map(item => (
              <div
                key={item}
                className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm"
              >
                {item}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onSelect(selected.filter(i => i !== item))}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
};