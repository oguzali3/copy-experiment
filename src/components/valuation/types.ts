export interface ValuationMetric {
  name: string;
  trend: "up" | "down" | "neutral";
  historicalData: {
    [year: string]: string;
  };
}

export const mockValuationMetrics: ValuationMetric[] = [
  { 
    name: "P/E Ratio", 
    trend: "up",
    historicalData: {
      "2019": "18.2x",
      "2020": "21.4x",
      "2021": "24.8x",
      "2022": "26.3x",
      "2023": "28.5x",
      "2024": "29.1x"
    }
  },
  { 
    name: "P/S Ratio", 
    trend: "down",
    historicalData: {
      "2019": "4.2x",
      "2020": "5.1x",
      "2021": "5.8x",
      "2022": "6.4x",
      "2023": "6.8x",
      "2024": "6.5x"
    }
  },
  { 
    name: "P/B Ratio", 
    trend: "up",
    historicalData: {
      "2019": "32.4x",
      "2020": "35.8x",
      "2021": "38.9x",
      "2022": "41.2x",
      "2023": "44.6x",
      "2024": "46.2x"
    }
  },
  { 
    name: "EV/EBITDA", 
    trend: "neutral",
    historicalData: {
      "2019": "15.6x",
      "2020": "17.2x",
      "2021": "18.9x",
      "2022": "20.1x",
      "2023": "21.3x",
      "2024": "21.5x"
    }
  },
  { 
    name: "PEG Ratio", 
    trend: "down",
    historicalData: {
      "2019": "1.4x",
      "2020": "1.6x",
      "2021": "1.8x",
      "2022": "2.0x",
      "2023": "2.1x",
      "2024": "1.9x"
    }
  }
];

export const mockChartData = [
  {
    period: "2019",
    metrics: [
      { name: "P/E Ratio", value: 18.2 },
      { name: "P/S Ratio", value: 4.2 },
      { name: "P/B Ratio", value: 32.4 },
      { name: "EV/EBITDA", value: 15.6 },
      { name: "PEG Ratio", value: 1.4 },
    ],
  },
  {
    period: "2020",
    metrics: [
      { name: "P/E Ratio", value: 21.4 },
      { name: "P/S Ratio", value: 5.1 },
      { name: "P/B Ratio", value: 35.8 },
      { name: "EV/EBITDA", value: 17.2 },
      { name: "PEG Ratio", value: 1.6 },
    ],
  },
  {
    period: "2021",
    metrics: [
      { name: "P/E Ratio", value: 24.8 },
      { name: "P/S Ratio", value: 5.8 },
      { name: "P/B Ratio", value: 38.9 },
      { name: "EV/EBITDA", value: 18.9 },
      { name: "PEG Ratio", value: 1.8 },
    ],
  },
  {
    period: "2022",
    metrics: [
      { name: "P/E Ratio", value: 26.3 },
      { name: "P/S Ratio", value: 6.4 },
      { name: "P/B Ratio", value: 41.2 },
      { name: "EV/EBITDA", value: 20.1 },
      { name: "PEG Ratio", value: 2.0 },
    ],
  },
  {
    period: "2023",
    metrics: [
      { name: "P/E Ratio", value: 28.5 },
      { name: "P/S Ratio", value: 6.8 },
      { name: "P/B Ratio", value: 44.6 },
      { name: "EV/EBITDA", value: 21.3 },
      { name: "PEG Ratio", value: 2.1 },
    ],
  },
  {
    period: "2024",
    metrics: [
      { name: "P/E Ratio", value: 29.1 },
      { name: "P/S Ratio", value: 6.5 },
      { name: "P/B Ratio", value: 46.2 },
      { name: "EV/EBITDA", value: 21.5 },
      { name: "PEG Ratio", value: 1.9 },
    ],
  },
];
