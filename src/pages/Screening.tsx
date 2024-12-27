import React, { useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { UserCircle, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScreeningSearch } from "@/components/screening/ScreeningSearch";
import { ScreeningTable } from "@/components/screening/ScreeningTable";
import { ScreeningMetric } from "@/types/screening";

const Screening = () => {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<ScreeningMetric[]>([]);
  const [excludeCountries, setExcludeCountries] = useState(false);
  const [excludeIndustries, setExcludeIndustries] = useState(false);
  const [excludeExchanges, setExcludeExchanges] = useState(false);

  const handleMetricAdd = (metric: ScreeningMetric) => {
    setSelectedMetrics(prev => [...prev, metric]);
  };

  const handleMetricRemove = (metricId: string) => {
    setSelectedMetrics(prev => prev.filter(m => m.id !== metricId));
  };

  const handleMetricRangeChange = (metricId: string, min: string, max: string) => {
    setSelectedMetrics(prev => prev.map(m => 
      m.id === metricId ? { ...m, min, max } : m
    ));
  };

  return (
    <div className="flex w-full">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <div className="bg-[#191d25] h-16 flex items-center px-6 gap-4">
          <SearchBar onStockSelect={() => {}} />
          <div className="flex items-center gap-2 ml-auto">
            <Button className="bg-[#077dfa] hover:bg-[#077dfa]/90 text-white">
              Upgrade
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-[#077dfa] w-12 h-16 flex flex-col items-center justify-center gap-1"
            >
              <UserCircle className="h-9 w-9" />
              <span className="text-xs text-white/80">Profile</span>
            </Button>
          </div>
        </div>

        <main className="flex-1 p-6 space-y-6 overflow-auto">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Stock Screener</h1>
              <Button
                variant="outline"
                className="text-sm"
                onClick={() => {
                  setSelectedCountries([]);
                  setSelectedIndustries([]);
                  setSelectedExchanges([]);
                  setSelectedMetrics([]);
                }}
              >
                Reset Metrics
              </Button>
            </div>

            <div className="grid gap-6">
              {/* Countries Section */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Countries</h2>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="exclude-countries"
                      checked={excludeCountries}
                      onCheckedChange={setExcludeCountries}
                    />
                    <Label htmlFor="exclude-countries">Exclude Countries</Label>
                  </div>
                </div>
                <ScreeningSearch
                  type="countries"
                  selected={selectedCountries}
                  onSelect={setSelectedCountries}
                />
                {selectedCountries.length > 0 && (
                  <ScrollArea className="h-12 mt-2">
                    <div className="flex gap-2 flex-wrap">
                      {selectedCountries.map(country => (
                        <div
                          key={country}
                          className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm"
                        >
                          {country}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => setSelectedCountries(prev => prev.filter(c => c !== country))}
                          />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </Card>

              {/* Industries Section */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Industries</h2>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="exclude-industries"
                      checked={excludeIndustries}
                      onCheckedChange={setExcludeIndustries}
                    />
                    <Label htmlFor="exclude-industries">Exclude Industries</Label>
                  </div>
                </div>
                <ScreeningSearch
                  type="industries"
                  selected={selectedIndustries}
                  onSelect={setSelectedIndustries}
                />
                {selectedIndustries.length > 0 && (
                  <ScrollArea className="h-12 mt-2">
                    <div className="flex gap-2 flex-wrap">
                      {selectedIndustries.map(industry => (
                        <div
                          key={industry}
                          className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm"
                        >
                          {industry}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => setSelectedIndustries(prev => prev.filter(i => i !== industry))}
                          />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </Card>

              {/* Exchanges Section */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Exchanges</h2>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="exclude-exchanges"
                      checked={excludeExchanges}
                      onCheckedChange={setExcludeExchanges}
                    />
                    <Label htmlFor="exclude-exchanges">Exclude Exchanges</Label>
                  </div>
                </div>
                <ScreeningSearch
                  type="exchanges"
                  selected={selectedExchanges}
                  onSelect={setSelectedExchanges}
                />
                {selectedExchanges.length > 0 && (
                  <ScrollArea className="h-12 mt-2">
                    <div className="flex gap-2 flex-wrap">
                      {selectedExchanges.map(exchange => (
                        <div
                          key={exchange}
                          className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm"
                        >
                          {exchange}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => setSelectedExchanges(prev => prev.filter(e => e !== exchange))}
                          />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </Card>

              {/* Screening Criteria Section */}
              <Card className="p-4">
                <h2 className="text-lg font-semibold mb-4">Screener Criteria</h2>
                <ScreeningSearch
                  type="metrics"
                  onMetricSelect={handleMetricAdd}
                />
                {selectedMetrics.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {selectedMetrics.map(metric => (
                      <Card key={metric.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{metric.name}</span>
                          <X
                            className="h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500"
                            onClick={() => handleMetricRemove(metric.id)}
                          />
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <Label>Min</Label>
                            <Input
                              type="number"
                              placeholder="Min value"
                              value={metric.min}
                              onChange={(e) => handleMetricRangeChange(metric.id, e.target.value, metric.max || '')}
                            />
                          </div>
                          <div className="flex-1">
                            <Label>Max</Label>
                            <Input
                              type="number"
                              placeholder="Max value"
                              value={metric.max}
                              onChange={(e) => handleMetricRangeChange(metric.id, metric.min || '', e.target.value)}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>

              {/* Results Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button className="bg-[#077dfa] hover:bg-[#077dfa]/90">
                    Run Screener
                  </Button>
                  <div className="text-sm text-gray-500">
                    Screener Results: 7
                  </div>
                </div>
                <ScreeningTable metrics={selectedMetrics} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Screening;