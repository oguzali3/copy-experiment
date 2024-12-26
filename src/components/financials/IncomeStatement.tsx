import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface IncomeStatementProps {
  timeFrame: "annual" | "quarterly" | "ttm";
}

export const IncomeStatement = ({ timeFrame }: IncomeStatementProps) => {
  const data = {
    annual: [
      { year: "2023", revenue: "60,922", revenueGrowth: "125.85%", costOfRevenue: "16,621", grossProfit: "44,301", sga: "2,654", researchDevelopment: "8,675", operatingExpenses: "11,329", operatingIncome: "32,972", interestExpense: "-257", investmentIncome: "866", otherIncome: "-1", ebt: "33,580", incomeTax: "4,058", netIncome: "29,760", eps: "1.21", epsDiluted: "1.19", sharesOutstanding: "24,690", sharesOutstandingDiluted: "24,940", ebitda: "34,480", ebitdaMargin: "56.60%", effectiveTaxRate: "12.00%" },
      { year: "2022", revenue: "26,974", revenueGrowth: "0.22%", costOfRevenue: "11,618", grossProfit: "15,356", sga: "2,440", researchDevelopment: "7,339", operatingExpenses: "9,779", operatingIncome: "5,577", interestExpense: "-262", investmentIncome: "267", otherIncome: "-3", ebt: "5,579", incomeTax: "-187", netIncome: "4,368", eps: "0.18", epsDiluted: "0.17", sharesOutstanding: "24,870", sharesOutstandingDiluted: "25,070", ebitda: "7,121", ebitdaMargin: "26.40%", effectiveTaxRate: "-" },
      { year: "2021", revenue: "26,914", revenueGrowth: "61.40%", costOfRevenue: "9,439", grossProfit: "17,475", sga: "2,166", researchDevelopment: "5,268", operatingExpenses: "7,434", operatingIncome: "10,041", interestExpense: "-236", investmentIncome: "29", otherIncome: "7", ebt: "9,841", incomeTax: "189", netIncome: "9,752", eps: "0.39", epsDiluted: "0.39", sharesOutstanding: "24,960", sharesOutstandingDiluted: "25,350", ebitda: "11,215", ebitdaMargin: "41.67%", effectiveTaxRate: "1.90%" },
      { year: "2020", revenue: "16,675", revenueGrowth: "52.73%", costOfRevenue: "6,118", grossProfit: "10,557", sga: "1,912", researchDevelopment: "3,924", operatingExpenses: "5,836", operatingIncome: "4,721", interestExpense: "-184", investmentIncome: "57", otherIncome: "4", ebt: "4,598", incomeTax: "77", netIncome: "4,332", eps: "0.18", epsDiluted: "0.17", sharesOutstanding: "24,670", sharesOutstandingDiluted: "25,100", ebitda: "5,819", ebitdaMargin: "34.90%", effectiveTaxRate: "1.75%" },
      { year: "2019", revenue: "10,918", revenueGrowth: "-6.81%", costOfRevenue: "4,150", grossProfit: "6,768", sga: "1,093", researchDevelopment: "2,829", operatingExpenses: "3,922", operatingIncome: "2,846", interestExpense: "-52", investmentIncome: "178", otherIncome: "-1", ebt: "2,971", incomeTax: "174", netIncome: "2,796", eps: "0.11", epsDiluted: "0.11", sharesOutstanding: "24,390", sharesOutstandingDiluted: "24,680", ebitda: "3,227", ebitdaMargin: "29.56%", effectiveTaxRate: "5.86%" }
    ],
    quarterly: [
      { year: "Q4 2023", revenue: "22,103", revenueGrowth: "22.03%", costOfRevenue: "5,945", grossProfit: "16,158", sga: "987", researchDevelopment: "2,884", operatingExpenses: "3,871", operatingIncome: "12,287", interestExpense: "-86", investmentIncome: "289", otherIncome: "0", ebt: "12,490", incomeTax: "2,038", netIncome: "10,452", eps: "0.42", epsDiluted: "0.41", sharesOutstanding: "24,690", sharesOutstandingDiluted: "24,940", ebitda: "12,873", ebitdaMargin: "58.24%", effectiveTaxRate: "16.32%" },
      { year: "Q3 2023", revenue: "18,120", revenueGrowth: "34.18%", costOfRevenue: "4,830", grossProfit: "13,290", sga: "856", researchDevelopment: "2,543", operatingExpenses: "3,399", operatingIncome: "9,891", interestExpense: "-85", investmentIncome: "237", otherIncome: "0", ebt: "10,043", incomeTax: "1,056", netIncome: "8,987", eps: "0.36", epsDiluted: "0.36", sharesOutstanding: "24,690", sharesOutstandingDiluted: "24,940", ebitda: "10,386", ebitdaMargin: "57.32%", effectiveTaxRate: "10.51%" },
      { year: "Q2 2023", revenue: "13,507", revenueGrowth: "101.48%", costOfRevenue: "3,950", grossProfit: "9,557", sga: "725", researchDevelopment: "2,000", operatingExpenses: "2,725", operatingIncome: "6,832", interestExpense: "-64", investmentIncome: "176", otherIncome: "0", ebt: "6,944", incomeTax: "756", netIncome: "6,188", eps: "0.25", epsDiluted: "0.25", sharesOutstanding: "24,690", sharesOutstandingDiluted: "24,940", ebitda: "7,174", ebitdaMargin: "53.11%", effectiveTaxRate: "10.89%" }
    ],
    ttm: [
      { year: "TTM", revenue: "113,269", revenueGrowth: "152.44%", costOfRevenue: "27,343", grossProfit: "85,926", sga: "3,228", researchDevelopment: "11,665", operatingExpenses: "14,893", operatingIncome: "71,033", interestExpense: "-249", investmentIncome: "1,569", otherIncome: "-2", ebt: "72,351", incomeTax: "9,841", netIncome: "63,074", eps: "2.56", epsDiluted: "2.53", sharesOutstanding: "24,598", sharesOutstandingDiluted: "24,863", ebitda: "72,741", ebitdaMargin: "64.22%", effectiveTaxRate: "13.50%" }
    ],
  };

  const currentData = data[timeFrame];

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px] bg-gray-50 font-semibold">Metrics</TableHead>
            {currentData.map((row) => (
              <TableHead key={row.year} className="text-right min-w-[120px]">{row.year}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">Revenue</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-revenue`} className="text-right">${row.revenue}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">Revenue Growth</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-growth`} className="text-right">{row.revenueGrowth}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">Cost of Revenue</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-cost`} className="text-right">${row.costOfRevenue}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">Gross Profit</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-gross`} className="text-right">${row.grossProfit}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">SG&A</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-sga`} className="text-right">${row.sga}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">R&D</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-rd`} className="text-right">${row.researchDevelopment}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">Operating Expenses</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-expenses`} className="text-right">${row.operatingExpenses}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">Operating Income</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-income`} className="text-right">${row.operatingIncome}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">Interest Expense</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-interest`} className="text-right">${row.interestExpense}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">Investment Income</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-investment`} className="text-right">${row.investmentIncome}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">Other Income</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-other`} className="text-right">${row.otherIncome}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">EBT</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-ebt`} className="text-right">${row.ebt}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">Income Tax</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-tax`} className="text-right">${row.incomeTax}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">Net Income</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-net`} className="text-right">${row.netIncome}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">EPS</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-eps`} className="text-right">${row.eps}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">EPS (Diluted)</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-eps-diluted`} className="text-right">${row.epsDiluted}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">Shares Outstanding</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-shares`} className="text-right">{row.sharesOutstanding}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">Shares Outstanding (Diluted)</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-shares-diluted`} className="text-right">{row.sharesOutstandingDiluted}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">EBITDA</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-ebitda`} className="text-right">${row.ebitda}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">EBITDA Margin</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-ebitda-margin`} className="text-right">{row.ebitdaMargin}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">Effective Tax Rate</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-tax-rate`} className="text-right">{row.effectiveTaxRate}</TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
