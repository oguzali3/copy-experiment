import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface KeyMetric {
  date?: string;
  [key: string]: any;
}

interface KeyMetricsTableProps {
  ttmData: KeyMetric[];
  historicalData: KeyMetric[];
}

const metricDisplayNames: Record<string, string> = {
  peRatioTTM: "P/E Ratio",
  priceToSalesRatioTTM: "P/S Ratio",
  pocfratioTTM: "P/OCF Ratio",
  pfcfRatioTTM: "P/FCF Ratio",
  pbRatioTTM: "P/B Ratio",
  ptbRatioTTM: "PTB Ratio",
  evToSalesTTM: "EV/Sales",
  enterpriseValueOverEBITDATTM: "EV/EBITDA",
  evToOperatingCashFlowTTM: "EV/Operating CF",
  evToFreeCashFlowTTM: "EV/Free CF",
  earningsYieldTTM: "Earnings Yield",
  freeCashFlowYieldTTM: "FCF Yield",
  debtToEquityTTM: "Debt/Equity",
  debtToAssetsTTM: "Debt/Assets",
  netDebtToEBITDATTM: "Net Debt/EBITDA",
  currentRatioTTM: "Current Ratio",
  interestCoverageTTM: "Interest Coverage",
  incomeQualityTTM: "Income Quality",
  dividendYieldTTM: "Dividend Yield",
  dividendYieldPercentageTTM: "Dividend Yield %",
  payoutRatioTTM: "Payout Ratio",
  salesGeneralAndAdministrativeToRevenueTTM: "SG&A/Revenue",
  researchAndDevelopementToRevenueTTM: "R&D/Revenue",
  intangiblesToTotalAssetsTTM: "Intangibles/Total Assets",
  capexToOperatingCashFlowTTM: "Capex/Operating CF",
  capexToRevenueTTM: "Capex/Revenue",
  capexToDepreciationTTM: "Capex/Depreciation"
};

const metricOrder = [
  "peRatioTTM",
  "priceToSalesRatioTTM",
  "pocfratioTTM",
  "pfcfRatioTTM",
  "pbRatioTTM",
  "ptbRatioTTM",
  "evToSalesTTM",
  "enterpriseValueOverEBITDATTM",
  "evToOperatingCashFlowTTM",
  "evToFreeCashFlowTTM",
  "earningsYieldTTM",
  "freeCashFlowYieldTTM",
  "debtToEquityTTM",
  "debtToAssetsTTM",
  "netDebtToEBITDATTM",
  "currentRatioTTM",
  "interestCoverageTTM",
  "incomeQualityTTM",
  "dividendYieldTTM",
  "dividendYieldPercentageTTM",
  "payoutRatioTTM",
  "salesGeneralAndAdministrativeToRevenueTTM",
  "researchAndDevelopementToRevenueTTM",
  "intangiblesToTotalAssetsTTM",
  "capexToOperatingCashFlowTTM",
  "capexToRevenueTTM",
  "capexToDepreciationTTM"
];

const formatMetricValue = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  
  // Format as percentage for yield and ratio metrics
  if (typeof value === 'number') {
    if (value < 0.01 && value > -0.01) {
      return value.toFixed(4);
    }
    return value.toFixed(2);
  }
  
  return 'N/A';
};

export const KeyMetricsTable = ({ ttmData, historicalData }: KeyMetricsTableProps) => {
  const sortedHistoricalData = [...historicalData].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const years = sortedHistoricalData.map(item => 
    item.date ? new Date(item.date).getFullYear().toString() : 'N/A'
  );

  return (
    <div className="bg-white rounded-lg border">
      <ScrollArea className="w-full rounded-md">
        <div className="max-w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px] sticky left-0 z-20 bg-gray-50 font-semibold">Metrics</TableHead>
                <TableHead className="text-right min-w-[120px]">TTM</TableHead>
                {years.map((year, index) => (
                  <TableHead key={index} className="text-right min-w-[120px]">{year}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {metricOrder.map((metricKey) => (
                <TableRow key={metricKey}>
                  <TableCell className="font-medium sticky left-0 z-20 bg-gray-50">
                    {metricDisplayNames[metricKey]}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatMetricValue(ttmData[0]?.[metricKey])}
                  </TableCell>
                  {sortedHistoricalData.map((item, index) => {
                    const historicalKey = metricKey.replace('TTM', '');
                    return (
                      <TableCell key={index} className="text-right">
                        {formatMetricValue(item[historicalKey])}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};