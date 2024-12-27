import React, { useState } from "react";
import { Card } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { IncomeStatement } from "./financials/IncomeStatement";
import { BalanceSheet } from "./financials/BalanceSheet";
import { CashFlow } from "./financials/CashFlow";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { TimeRangePanel } from "./financials/TimeRangePanel";
import { MetricChart } from "./financials/MetricChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const financialData: { [key: string]: any } = {
  AAPL: {
    annual: [
      { period: "2023", revenue: "60922", revenueGrowth: "125.85", costOfRevenue: "16621", grossProfit: "44301", totalAssets: "110716", totalLiabilities: "42781", totalEquity: "67935", operatingCashFlow: "27021", investingCashFlow: "-15783", financingCashFlow: "-8762", freeCashFlow: "27021", sga: "2654", researchDevelopment: "8675", operatingExpenses: "11329", operatingIncome: "32972", netIncome: "29760", ebitda: "34480" },
      { period: "2022", revenue: "26974", revenueGrowth: "0.22", costOfRevenue: "11618", grossProfit: "15356", totalAssets: "44187", totalLiabilities: "15892", totalEquity: "28295", operatingCashFlow: "3808", investingCashFlow: "-7225", financingCashFlow: "-10413", freeCashFlow: "3808", sga: "2440", researchDevelopment: "7339", operatingExpenses: "9779", operatingIncome: "5577", netIncome: "4368", ebitda: "7121" },
      { period: "2021", revenue: "26914", revenueGrowth: "61.40", costOfRevenue: "9439", grossProfit: "17475", totalAssets: "44187", totalLiabilities: "15892", totalEquity: "28295", operatingCashFlow: "8132", investingCashFlow: "-4485", financingCashFlow: "-3128", freeCashFlow: "8132", sga: "2166", researchDevelopment: "5268", operatingExpenses: "7434", operatingIncome: "10041", netIncome: "9752", ebitda: "11215" },
      { period: "2020", revenue: "16675", revenueGrowth: "52.73", costOfRevenue: "6118", grossProfit: "10557", totalAssets: "28791", totalLiabilities: "10418", totalEquity: "18373", operatingCashFlow: "4694", investingCashFlow: "-3892", financingCashFlow: "-2654", freeCashFlow: "4694", sga: "1912", researchDevelopment: "3924", operatingExpenses: "5836", operatingIncome: "4721", netIncome: "4332", ebitda: "5819" },
      { period: "2019", revenue: "10918", revenueGrowth: "-6.81", costOfRevenue: "4150", grossProfit: "6768", totalAssets: "17315", totalLiabilities: "6232", totalEquity: "11083", operatingCashFlow: "4272", investingCashFlow: "-2987", financingCashFlow: "-1876", freeCashFlow: "4272", sga: "1093", researchDevelopment: "2829", operatingExpenses: "3922", operatingIncome: "2846", netIncome: "2796", ebitda: "3227" }
    ]
  },
  MSFT: {
    annual: [
      { period: "2023", revenue: "211915", revenueGrowth: "18.0", costOfRevenue: "66345", grossProfit: "145570", totalAssets: "405610", totalLiabilities: "195951", totalEquity: "209659", operatingCashFlow: "87665", investingCashFlow: "-19840", financingCashFlow: "-65925", freeCashFlow: "59477", sga: "25786", researchDevelopment: "27195", operatingExpenses: "52981", operatingIncome: "88523", netIncome: "72361", ebitda: "102093" },
      { period: "2022", revenue: "198270", revenueGrowth: "16.4", costOfRevenue: "62650", grossProfit: "135620", totalAssets: "364840", totalLiabilities: "183248", totalEquity: "181592", operatingCashFlow: "89035", investingCashFlow: "-30311", financingCashFlow: "-59968", freeCashFlow: "63329", sga: "23428", researchDevelopment: "24512", operatingExpenses: "47940", operatingIncome: "83383", netIncome: "67428", ebitda: "96937" },
      { period: "2021", revenue: "168088", revenueGrowth: "21.6", costOfRevenue: "52232", grossProfit: "115856", totalAssets: "333779", totalLiabilities: "172433", totalEquity: "161346", operatingCashFlow: "76740", investingCashFlow: "-27577", financingCashFlow: "-51021", freeCashFlow: "56118", sga: "21973", researchDevelopment: "20716", operatingExpenses: "42689", operatingIncome: "69916", netIncome: "61271", ebitda: "84047" },
      { period: "2020", revenue: "143015", revenueGrowth: "14.0", costOfRevenue: "46078", grossProfit: "96937", totalAssets: "301311", totalLiabilities: "183007", totalEquity: "118304", operatingCashFlow: "60675", investingCashFlow: "-12223", financingCashFlow: "-46031", freeCashFlow: "45234", sga: "20161", researchDevelopment: "19269", operatingExpenses: "39430", operatingIncome: "52959", netIncome: "44281", ebitda: "69907" },
      { period: "2019", revenue: "125843", revenueGrowth: "14.2", costOfRevenue: "42910", grossProfit: "82933", totalAssets: "286556", totalLiabilities: "184226", totalEquity: "102330", operatingCashFlow: "52185", investingCashFlow: "-15773", financingCashFlow: "-36887", freeCashFlow: "38260", sga: "18213", researchDevelopment: "16876", operatingExpenses: "35089", operatingIncome: "42959", netIncome: "39240", ebitda: "55262" }
    ]
  },
  GOOGL: {
    annual: [
      { period: "2023", revenue: "307394", revenueGrowth: "8.7", costOfRevenue: "131457", grossProfit: "175937", totalAssets: "411808", totalLiabilities: "107454", totalEquity: "304354", operatingCashFlow: "91495", investingCashFlow: "-33705", financingCashFlow: "-47846", freeCashFlow: "69840", sga: "45454", researchDevelopment: "47345", operatingExpenses: "92799", operatingIncome: "83138", netIncome: "73795", ebitda: "96890" },
      { period: "2022", revenue: "282836", revenueGrowth: "9.8", costOfRevenue: "126203", grossProfit: "156633", totalAssets: "365636", totalLiabilities: "103807", totalEquity: "261829", operatingCashFlow: "91495", investingCashFlow: "-25883", financingCashFlow: "-58599", freeCashFlow: "60010", sga: "41972", researchDevelopment: "39500", operatingExpenses: "81472", operatingIncome: "75161", netIncome: "59972", ebitda: "87127" },
      { period: "2021", revenue: "257637", revenueGrowth: "41.2", costOfRevenue: "110939", grossProfit: "146698", totalAssets: "359268", totalLiabilities: "97072", totalEquity: "262196", operatingCashFlow: "91652", investingCashFlow: "-28589", financingCashFlow: "-61403", freeCashFlow: "67012", sga: "36422", researchDevelopment: "31562", operatingExpenses: "67984", operatingIncome: "78714", netIncome: "76033", ebitda: "89961" },
      { period: "2020", revenue: "182527", revenueGrowth: "12.8", costOfRevenue: "84732", grossProfit: "97795", totalAssets: "319616", totalLiabilities: "97072", totalEquity: "222544", operatingCashFlow: "65124", investingCashFlow: "-32773", financingCashFlow: "-24408", freeCashFlow: "42843", sga: "28998", researchDevelopment: "27573", operatingExpenses: "56571", operatingIncome: "41224", netIncome: "40269", ebitda: "54921" },
      { period: "2019", revenue: "161857", revenueGrowth: "18.3", costOfRevenue: "71896", grossProfit: "89961", totalAssets: "275909", totalLiabilities: "74467", totalEquity: "201442", operatingCashFlow: "54520", investingCashFlow: "-29491", financingCashFlow: "-23209", freeCashFlow: "30972", sga: "28015", researchDevelopment: "26018", operatingExpenses: "54033", operatingIncome: "35928", netIncome: "34343", ebitda: "48149" }
    ]
  },
  META: {
    annual: [
      { period: "2023", revenue: "134902", revenueGrowth: "16.3", costOfRevenue: "28132", grossProfit: "106770", totalAssets: "196861", totalLiabilities: "53015", totalEquity: "143846", operatingCashFlow: "71120", investingCashFlow: "-31014", financingCashFlow: "-38774", freeCashFlow: "43751", sga: "31693", researchDevelopment: "35338", operatingExpenses: "67031", operatingIncome: "39739", netIncome: "39098", ebitda: "47892" },
      { period: "2022", revenue: "116609", revenueGrowth: "-1.1", costOfRevenue: "25249", grossProfit: "91360", totalAssets: "165987", totalLiabilities: "53015", totalEquity: "112972", operatingCashFlow: "50475", investingCashFlow: "-27957", financingCashFlow: "-27892", freeCashFlow: "31506", sga: "31632", researchDevelopment: "35338", operatingExpenses: "66970", operatingIncome: "28944", netIncome: "23200", ebitda: "36909" },
      { period: "2021", revenue: "117929", revenueGrowth: "37.2", costOfRevenue: "22649", grossProfit: "95280", totalAssets: "165987", totalLiabilities: "47277", totalEquity: "118710", operatingCashFlow: "57683", investingCashFlow: "-18636", financingCashFlow: "-50728", freeCashFlow: "39116", sga: "24766", researchDevelopment: "24655", operatingExpenses: "49421", operatingIncome: "46753", netIncome: "39370", ebitda: "54721" },
      { period: "2020", revenue: "85965", revenueGrowth: "21.6", costOfRevenue: "16692", grossProfit: "69273", totalAssets: "159316", totalLiabilities: "32601", totalEquity: "126715", operatingCashFlow: "38747", investingCashFlow: "-30059", financingCashFlow: "-11092", freeCashFlow: "23632", sga: "19573", researchDevelopment: "18447", operatingExpenses: "38020", operatingIncome: "32671", netIncome: "29146", ebitda: "39033" },
      { period: "2019", revenue: "70697", revenueGrowth: "26.6", costOfRevenue: "12770", grossProfit: "57927", totalAssets: "133376", totalLiabilities: "32601", totalEquity: "100775", operatingCashFlow: "36314", investingCashFlow: "-19864", financingCashFlow: "-7299", freeCashFlow: "21212", sga: "15297", researchDevelopment: "13600", operatingExpenses: "28897", operatingIncome: "23986", netIncome: "18485", ebitda: "29773" }
    ]
  }
};

export const FinancialStatements = ({ ticker }: { ticker: string }) => {
  const [timeFrame, setTimeFrame] = useState<"annual" | "quarterly" | "ttm">("annual");
  const [startDate, setStartDate] = useState("December 31, 2019");
  const [endDate, setEndDate] = useState("December 31, 2023");
  const [sliderValue, setSliderValue] = useState([0, 4]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  // Reset selected metrics when ticker changes
  React.useEffect(() => {
    setSelectedMetrics([]);
  }, [ticker]);

  // Define the available time periods
  const timePeriods = [
    "2019", "2020", "2021", "2022", "2023"
  ];

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    setStartDate(`December 31, 20${19 + value[0]}`);
    setEndDate(`December 31, 20${19 + value[1]}`);
  };

  const getMetricData = (metrics: string[]) => {
    const data = financialData[ticker]?.[timeFrame] || financialData["AAPL"][timeFrame];

    // Filter data based on the selected time range
    const filteredData = data
      .filter(item => {
        const year = parseInt(item.period);
        return year >= 2019 + sliderValue[0] && year <= 2019 + sliderValue[1];
      });

    return filteredData.map(item => ({
      period: item.period,
      metrics: metrics.map(metricId => ({
        name: getMetricLabel(metricId),
        value: parseFloat((item[metricId as keyof typeof item] || "0").replace(/,/g, '')),
      })),
    }));
  };

  // Get metric label
  const getMetricLabel = (metricId: string): string => {
    const metrics = {
      revenue: "Revenue",
      revenueGrowth: "Revenue Growth",
      costOfRevenue: "Cost of Revenue",
      grossProfit: "Gross Profit",
      totalAssets: "Total Assets",
      totalLiabilities: "Total Liabilities",
      totalEquity: "Total Equity",
      operatingCashFlow: "Operating Cash Flow",
      investingCashFlow: "Investing Cash Flow",
      financingCashFlow: "Financing Cash Flow",
      freeCashFlow: "Free Cash Flow",
      sga: "SG&A",
      researchDevelopment: "R&D",
      operatingExpenses: "Operating Expenses",
      operatingIncome: "Operating Income",
      netIncome: "Net Income",
      ebitda: "EBITDA"
    };
    return metrics[metricId as keyof typeof metrics] || metricId;
  };

  return (
    <div className="space-y-6">
      {selectedMetrics.length > 0 && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Selected Metrics</h2>
            <Select value={chartType} onValueChange={(value: "bar" | "line") => setChartType(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <MetricChart 
            data={getMetricData(selectedMetrics)}
            metrics={selectedMetrics.map(getMetricLabel)}
            chartType={chartType}
          />
        </Card>
      )}
      
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Financial Statements</h2>
            <RadioGroup
              defaultValue="annual"
              onValueChange={(value) => setTimeFrame(value as "annual" | "quarterly" | "ttm")}
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
          </div>

          <TimeRangePanel
            startDate={startDate}
            endDate={endDate}
            sliderValue={sliderValue}
            onSliderChange={handleSliderChange}
            timePeriods={timePeriods}
          />

          <Tabs defaultValue="income" className="w-full">
            <TabsList className="w-full justify-start mb-4">
              <TabsTrigger value="income">Income Statement</TabsTrigger>
              <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
              <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
            </TabsList>
            <TabsContent value="income">
              <div className="space-y-6">
                <IncomeStatement 
                  timeFrame={timeFrame} 
                  selectedMetrics={selectedMetrics}
                  onMetricsChange={setSelectedMetrics}
                />
              </div>
            </TabsContent>
            <TabsContent value="balance">
              <div className="space-y-6">
                <BalanceSheet 
                  timeFrame={timeFrame} 
                  selectedMetrics={selectedMetrics}
                  onMetricsChange={setSelectedMetrics}
                />
              </div>
            </TabsContent>
            <TabsContent value="cashflow">
              <div className="space-y-6">
                <CashFlow 
                  timeFrame={timeFrame}
                  selectedMetrics={selectedMetrics}
                  onMetricsChange={setSelectedMetrics}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};