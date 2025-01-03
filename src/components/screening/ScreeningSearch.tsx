import React, { useState, useEffect } from "react";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScreeningMetric } from "@/types/screening";

interface ScreeningSearchProps {
  type: "countries" | "industries" | "exchanges" | "metrics";
  selected?: string[];
  onSelect?: (items: string[]) => void;
  onMetricSelect?: (metric: ScreeningMetric) => void;
}

export const ScreeningSearch = ({ type, selected = [], onSelect, onMetricSelect }: ScreeningSearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [options, setOptions] = useState<string[]>([]);

  const { data: stocksData } = useQuery({
    queryKey: ['stocks-metadata', type],
    queryFn: async () => {
      if (type === 'metrics') return [];

      const { data, error } = await supabase
        .from('stocks')
        .select(type === 'countries' ? 'country' : type === 'industries' ? 'industry' : 'exchange');

      if (error) throw error;

      const uniqueValues = Array.from(new Set(
        data
          .map(item => item[type === 'countries' ? 'country' : type === 'industries' ? 'industry' : 'exchange'])
          .filter(Boolean)
      )).sort();

      return uniqueValues;
    }
  });

  useEffect(() => {
    if (stocksData) {
      setOptions(stocksData);
    }
  }, [stocksData]);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (value: string) => {
    if (type === 'metrics') {
      // Handle metric selection
      if (onMetricSelect) {
        const metric = {
          id: value.toLowerCase(),
          name: value,
          category: 'Financial',
          min: '',
          max: ''
        };
        onMetricSelect(metric);
      }
    } else {
      // Handle other selections
      if (onSelect) {
        if (selected.includes(value)) {
          onSelect(selected.filter(item => item !== value));
        } else {
          onSelect([...selected, value]);
        }
      }
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <div
        className="relative w-full cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <input
          className="w-full px-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`Search ${type}...`}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onClick={() => setOpen(true)}
        />
        <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg">
          <Command>
            <Command.Input
              value={searchValue}
              onValueChange={setSearchValue}
              className="w-full px-4 py-2 text-sm border-b focus:outline-none"
              placeholder={`Search ${type}...`}
            />
            <Command.List className="max-h-64 overflow-y-auto p-2">
              {filteredOptions.length === 0 ? (
                <Command.Empty className="py-2 px-4 text-sm text-gray-500">
                  No results found.
                </Command.Empty>
              ) : (
                filteredOptions.map((option) => (
                  <Command.Item
                    key={option}
                    value={option}
                    onSelect={() => handleSelect(option)}
                    className={`px-4 py-2 text-sm rounded cursor-pointer ${
                      selected.includes(option)
                        ? "bg-blue-50 text-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {option}
                  </Command.Item>
                ))
              )}
            </Command.List>
          </Command>
        </div>
      )}
    </div>
  );
};