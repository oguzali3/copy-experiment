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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px]">Period</TableHead>
          <TableHead>Revenue</TableHead>
          <TableHead>Revenue Growth</TableHead>
          <TableHead>Cost of Revenue</TableHead>
          <TableHead>Gross Profit</TableHead>
          <TableHead>SG&A</TableHead>
          <TableHead>R&D</TableHead>
          <TableHead>Operating Expenses</TableHead>
          <TableHead>Operating Income</TableHead>
          <TableHead>Interest Expense</TableHead>
          <TableHead>Investment Income</TableHead>
          <TableHead>Other Income</TableHead>
          <TableHead>EBT</TableHead>
          <TableHead>Income Tax</TableHead>
          <TableHead>Net Income</TableHead>
          <TableHead>EPS</TableHead>
          <TableHead>EPS (Diluted)</TableHead>
          <TableHead>Shares Outstanding</TableHead>
          <TableHead>Shares Outstanding (Diluted)</TableHead>
          <TableHead>EBITDA</TableHead>
          <TableHead>EBITDA Margin</TableHead>
          <TableHead>Effective Tax Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {currentData.map((row) => (
          <TableRow key={row.year}>
            <TableCell className="font-medium">{row.year}</TableCell>
            <TableCell>${row.revenue}</TableCell>
            <TableCell>{row.revenueGrowth}</TableCell>
            <TableCell>${row.costOfRevenue}</TableCell>
            <TableCell>${row.grossProfit}</TableCell>
            <TableCell>${row.sga}</TableCell>
            <TableCell>${row.researchDevelopment}</TableCell>
            <TableCell>${row.operatingExpenses}</TableCell>
            <TableCell>${row.operatingIncome}</TableCell>
            <TableCell>${row.interestExpense}</TableCell>
            <TableCell>${row.investmentIncome}</TableCell>
            <TableCell>${row.otherIncome}</TableCell>
            <TableCell>${row.ebt}</TableCell>
            <TableCell>${row.incomeTax}</TableCell>
            <TableCell>${row.netIncome}</TableCell>
            <TableCell>${row.eps}</TableCell>
            <TableCell>${row.epsDiluted}</TableCell>
            <TableCell>{row.sharesOutstanding}</TableCell>
            <TableCell>{row.sharesOutstandingDiluted}</TableCell>
            <TableCell>${row.ebitda}</TableCell>
            <TableCell>{row.ebitdaMargin}</TableCell>
            <TableCell>{row.effectiveTaxRate}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};