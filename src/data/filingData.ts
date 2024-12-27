import { FilingData } from "@/types/filing";

export const filingData: FilingData = {
  AAPL: [
    {
      id: "1",
      type: "10-Q",
      title: "Quarterly Report",
      date: "2024-01-15",
      form: "Form 10-Q",
      description: "Quarterly report for the period ending December 31, 2023",
      url: "https://www.sec.gov/ix?doc=/Archives/edgar/data/320193/000032019324000006/aapl-20231230.htm"
    },
    {
      id: "2",
      type: "10-K",
      title: "Annual Report",
      date: "2023-11-03",
      form: "Form 10-K",
      description: "Annual report for the fiscal year ending September 30, 2023",
      url: "https://www.sec.gov/ix?doc=/Archives/edgar/data/320193/000032019323000106/aapl-20230930.htm"
    },
    {
      id: "3",
      type: "8-K",
      title: "Current Report",
      date: "2023-10-15",
      form: "Form 8-K",
      description: "Results of Operations and Financial Condition",
      url: "#"
    },
    // Add more Apple filings...
  ],
  MSFT: [
    {
      id: "1",
      type: "10-Q",
      title: "Quarterly Report",
      date: "2024-01-20",
      form: "Form 10-Q",
      description: "Quarterly report for the period ending December 31, 2023",
      url: "#"
    },
    {
      id: "2",
      type: "10-K",
      title: "Annual Report",
      date: "2023-11-10",
      form: "Form 10-K",
      description: "Annual report for the fiscal year ending September 30, 2023",
      url: "#"
    },
    {
      id: "3",
      type: "8-K",
      title: "Current Report",
      date: "2023-10-20",
      form: "Form 8-K",
      description: "Results of Operations and Financial Condition",
      url: "#"
    },
    // Add more Microsoft filings...
  ]
};