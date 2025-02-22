import React from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { ScreeningSearch } from "./ScreeningSearch";
import { Badge } from "@/components/ui/badge";
import { COUNTRIES, EXCHANGES } from "@/constants/marketFilters";
import { CountryFlag } from "./CountryFlag";

interface FilterSectionProps {
  title: string;
  selected: string[];
  onSelect: (items: string[]) => void;
  excludeEnabled: boolean;
  onExcludeChange: (value: boolean) => void;
  type: "countries" | "exchanges";
}

export const FilterSection = ({
  title,
  selected,
  onSelect,
  excludeEnabled,
  onExcludeChange,
  type,
}: FilterSectionProps) => {
  const getDisplayName = (code: string) => {
    if (type === "countries") {
      const country = COUNTRIES.find(c => c.code === code);
      return country?.name || code;
    } else {
      const exchange = EXCHANGES.find(e => e.code === code);
      return exchange ? `${exchange.code} - ${exchange.name}` : code;
    }
  };

  const getRegion = (code: string) => {
    if (type === "countries") {
      return COUNTRIES.find(c => c.code === code)?.region || 'Other';
    } else {
      return EXCHANGES.find(e => e.code === code)?.region || 'Other';
    }
  };

  const groupedSelected = selected.reduce((acc, code) => {
    const region = getRegion(code);
    if (!acc[region]) acc[region] = [];
    acc[region].push(code);
    return acc;
  }, {} as Record<string, string[]>);

  const renderSelectedItem = (code: string) => {
    if (type === "countries") {
      return (
        <Badge
          key={code}
          variant="secondary"
          className="flex items-center gap-2 py-1 px-2"
        >
          <CountryFlag countryCode={code} size="sm" showName={false} />
          <span>{getDisplayName(code)}</span>
          <X
            className="h-3 w-3 cursor-pointer hover:text-red-500 ml-1"
            onClick={() => onSelect(selected.filter(i => i !== code))}
          />
        </Badge>
      );
    }

    return (
      <Badge
        key={code}
        variant="secondary"
        className="flex items-center gap-1"
      >
        {getDisplayName(code)}
        <X
          className="h-3 w-3 cursor-pointer hover:text-red-500"
          onClick={() => onSelect(selected.filter(i => i !== code))}
        />
      </Badge>
    );
  };

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
          <Label htmlFor={`exclude-${type}`}>
            {excludeEnabled ? 'Exclude' : 'Include'} {title}
          </Label>
        </div>
      </div>
      
      <ScreeningSearch
        type={type}
        selected={selected}
        onSelect={onSelect}
      />

      {selected.length > 0 && (
        <div className="mt-4">
          {Object.entries(groupedSelected).map(([region, codes]) => (
            <div key={region} className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">{region}</h3>
              <div className="flex flex-wrap gap-2">
                {codes.map(code => renderSelectedItem(code))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};