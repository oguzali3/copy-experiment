import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ScreeningMetric } from "@/types/screening";
import { SearchItem } from "./types";
import { SearchDialog } from "./SearchDialog";
import { SearchProvider } from "./SearchProvider";
import { getPlaceholderText } from "./searchUtils";

interface ScreeningSearchProps {
  type: "countries" | "industries" | "exchanges" | "metrics";
  selected?: string[];
  onSelect?: (selected: string[]) => void;
  onMetricSelect?: (metric: ScreeningMetric) => void;
}

export const ScreeningSearch = ({
  type,
  selected = [],
  onSelect,
  onMetricSelect
}: ScreeningSearchProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleSelect = (item: SearchItem) => {
    try {
      if (!item?.name) {
        console.error('Invalid item selected:', item);
        return;
      }

      if (type === "metrics" && onMetricSelect) {
        onMetricSelect({
          id: item.id || '',
          name: item.name,
          category: item.category || '',
          min: "",
          max: ""
        });
      } else if (onSelect) {
        const value = item.name;
        if (selected.includes(value)) {
          onSelect(selected.filter(i => i !== value));
        } else {
          onSelect([...selected, value]);
        }
      }
      setOpen(false);
    } catch (error) {
      console.error('Error handling selection:', error);
    }
  };

  return (
    <SearchProvider type={type}>
      <div className="relative w-full">
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
          onClick={() => setOpen(true)}
        >
          <Search className="mr-2 h-4 w-4" />
          <span>{getPlaceholderText(type, loading)}</span>
        </Button>
        <SearchDialog
          open={open}
          onOpenChange={setOpen}
          type={type}
          onSelect={handleSelect}
        />
      </div>
    </SearchProvider>
  );
};