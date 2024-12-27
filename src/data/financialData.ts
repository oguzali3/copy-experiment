export type FinancialData = {
  period: string;
  revenue: string;
  revenueGrowth: string;
  costOfRevenue: string;
  grossProfit: string;
  totalAssets: string;
  totalLiabilities: string;
  totalEquity: string;
  operatingCashFlow: string;
  investingCashFlow: string;
  financingCashFlow: string;
  freeCashFlow: string;
  sga: string;
  researchDevelopment: string;
  operatingExpenses: string;
  operatingIncome: string;
  netIncome: string;
  ebitda: string;
};

export type CompanyFinancialData = {
  [key: string]: {
    annual: FinancialData[];
    quarterly?: FinancialData[];
    ttm?: FinancialData[];
  };
};

export const financialData: CompanyFinancialData = {
  AAPL: {
    annual: [
      { period: "2023", revenue: "383,285", revenueGrowth: "2.8", costOfRevenue: "222,793", grossProfit: "160,492", totalAssets: "352,583", totalLiabilities: "278,912", totalEquity: "73,671", operatingCashFlow: "110,543", investingCashFlow: "-8,115", financingCashFlow: "-104,094", freeCashFlow: "96,524", sga: "25,116", researchDevelopment: "29,915", operatingExpenses: "55,031", operatingIncome: "105,461", netIncome: "96,995", ebitda: "123,642" },
      { period: "2022", revenue: "394,328", revenueGrowth: "7.8", costOfRevenue: "223,546", grossProfit: "170,782", totalAssets: "352,755", totalLiabilities: "302,083", totalEquity: "50,672", operatingCashFlow: "122,151", investingCashFlow: "-10,731", financingCashFlow: "-110,749", freeCashFlow: "107,587", sga: "25,094", researchDevelopment: "26,251", operatingExpenses: "51,345", operatingIncome: "119,437", netIncome: "99,803", ebitda: "130,543" },
      { period: "2021", revenue: "365,817", revenueGrowth: "33.2", costOfRevenue: "212,981", grossProfit: "152,836", totalAssets: "351,002", totalLiabilities: "287,912", totalEquity: "63,090", operatingCashFlow: "104,038", investingCashFlow: "-14,545", financingCashFlow: "-93,353", freeCashFlow: "92,953", sga: "21,973", researchDevelopment: "21,914", operatingExpenses: "43,887", operatingIncome: "108,949", netIncome: "94,680", ebitda: "120,233" },
      { period: "2020", revenue: "274,515", revenueGrowth: "5.5", costOfRevenue: "169,559", grossProfit: "104,956", totalAssets: "323,888", totalLiabilities: "258,549", totalEquity: "65,339", operatingCashFlow: "80,674", investingCashFlow: "-4,289", financingCashFlow: "-86,820", freeCashFlow: "73,365", sga: "19,916", researchDevelopment: "18,752", operatingExpenses: "38,668", operatingIncome: "66,288", netIncome: "57,411", ebitda: "77,344" },
      { period: "2019", revenue: "260,174", revenueGrowth: "-2.0", costOfRevenue: "161,782", grossProfit: "98,392", totalAssets: "338,516", totalLiabilities: "248,028", totalEquity: "90,488", operatingCashFlow: "69,391", investingCashFlow: "-45,896", financingCashFlow: "-90,976", freeCashFlow: "58,896", sga: "18,245", researchDevelopment: "16,217", operatingExpenses: "34,462", operatingIncome: "63,930", netIncome: "55,256", ebitda: "71,439" }
    ]
  },
  MSFT: {
    annual: [
      { period: "2023", revenue: "211,915", revenueGrowth: "18.0", costOfRevenue: "66,345", grossProfit: "145,570", totalAssets: "405,610", totalLiabilities: "195,951", totalEquity: "209,659", operatingCashFlow: "87,665", investingCashFlow: "-19,840", financingCashFlow: "-65,925", freeCashFlow: "59,477", sga: "25,786", researchDevelopment: "27,195", operatingExpenses: "52,981", operatingIncome: "88,523", netIncome: "72,361", ebitda: "102,093" },
      { period: "2022", revenue: "198,270", revenueGrowth: "16.4", costOfRevenue: "62,650", grossProfit: "135,620", totalAssets: "364,840", totalLiabilities: "183,248", totalEquity: "181,592", operatingCashFlow: "89,035", investingCashFlow: "-30,311", financingCashFlow: "-59,968", freeCashFlow: "63,329", sga: "23,428", researchDevelopment: "24,512", operatingExpenses: "47,940", operatingIncome: "83,383", netIncome: "67,428", ebitda: "96,937" },
      { period: "2021", revenue: "168,088", revenueGrowth: "21.6", costOfRevenue: "52,232", grossProfit: "115,856", totalAssets: "333,779", totalLiabilities: "172,433", totalEquity: "161,346", operatingCashFlow: "76,740", investingCashFlow: "-27,577", financingCashFlow: "-51,021", freeCashFlow: "56,118", sga: "21,973", researchDevelopment: "20,716", operatingExpenses: "42,689", operatingIncome: "69,916", netIncome: "61,271", ebitda: "84,047" },
      { period: "2020", revenue: "143,015", revenueGrowth: "14.0", costOfRevenue: "46,078", grossProfit: "96,937", totalAssets: "301,311", totalLiabilities: "183,007", totalEquity: "118,304", operatingCashFlow: "60,675", investingCashFlow: "-12,223", financingCashFlow: "-46,031", freeCashFlow: "45,234", sga: "20,161", researchDevelopment: "19,269", operatingExpenses: "39,430", operatingIncome: "52,959", netIncome: "44,281", ebitda: "69,907" },
      { period: "2019", revenue: "125,843", revenueGrowth: "14.2", costOfRevenue: "42,910", grossProfit: "82,933", totalAssets: "286,556", totalLiabilities: "184,226", totalEquity: "102,330", operatingCashFlow: "52,185", investingCashFlow: "-15,773", financingCashFlow: "-36,887", freeCashFlow: "38,260", sga: "18,213", researchDevelopment: "16,876", operatingExpenses: "35,089", operatingIncome: "42,959", netIncome: "39,240", ebitda: "55,262" }
    ]
  },
  GOOGL: {
    annual: [
      { period: "2023", revenue: "307,394", revenueGrowth: "8.7", costOfRevenue: "131,457", grossProfit: "175,937", totalAssets: "411,808", totalLiabilities: "107,454", totalEquity: "304,354", operatingCashFlow: "91,495", investingCashFlow: "-33,705", financingCashFlow: "-47,846", freeCashFlow: "69,840", sga: "45,454", researchDevelopment: "47,345", operatingExpenses: "92,799", operatingIncome: "83,138", netIncome: "73,795", ebitda: "96,890" },
      { period: "2022", revenue: "282,836", revenueGrowth: "9.8", costOfRevenue: "126,203", grossProfit: "156,633", totalAssets: "365,636", totalLiabilities: "103,807", totalEquity: "261,829", operatingCashFlow: "91,495", investingCashFlow: "-25,883", financingCashFlow: "-58,599", freeCashFlow: "60,010", sga: "41,972", researchDevelopment: "39,500", operatingExpenses: "81,472", operatingIncome: "75,161", netIncome: "59,972", ebitda: "87,127" },
      { period: "2021", revenue: "257,637", revenueGrowth: "41.2", costOfRevenue: "110,939", grossProfit: "146,698", totalAssets: "359,268", totalLiabilities: "97,072", totalEquity: "262,196", operatingCashFlow: "91,652", investingCashFlow: "-28,589", financingCashFlow: "-61,403", freeCashFlow: "67,012", sga: "36,422", researchDevelopment: "31,562", operatingExpenses: "67,984", operatingIncome: "78,714", netIncome: "76,033", ebitda: "89,961" },
      { period: "2020", revenue: "182,527", revenueGrowth: "12.8", costOfRevenue: "84,732", grossProfit: "97,795", totalAssets: "319,616", totalLiabilities: "97,072", totalEquity: "222,544", operatingCashFlow: "65,124", investingCashFlow: "-32,773", financingCashFlow: "-24,408", freeCashFlow: "42,843", sga: "28,998", researchDevelopment: "27,573", operatingExpenses: "56,571", operatingIncome: "41,224", netIncome: "40,269", ebitda: "54,921" },
      { period: "2019", revenue: "161,857", revenueGrowth: "18.3", costOfRevenue: "71,896", grossProfit: "89,961", totalAssets: "275,909", totalLiabilities: "74,467", totalEquity: "201,442", operatingCashFlow: "54,520", investingCashFlow: "-29,491", financingCashFlow: "-23,209", freeCashFlow: "30,972", sga: "28,015", researchDevelopment: "26,018", operatingExpenses: "54,033", operatingIncome: "35,928", netIncome: "34,343", ebitda: "48,149" }
    ]
  },
  META: {
    annual: [
      { period: "2023", revenue: "134,902", revenueGrowth: "16.3", costOfRevenue: "28,132", grossProfit: "106,770", totalAssets: "196,861", totalLiabilities: "53,015", totalEquity: "143,846", operatingCashFlow: "71,120", investingCashFlow: "-31,014", financingCashFlow: "-38,774", freeCashFlow: "43,751", sga: "31,693", researchDevelopment: "35,338", operatingExpenses: "67,031", operatingIncome: "39,739", netIncome: "39,098", ebitda: "47,892" },
      { period: "2022", revenue: "116,609", revenueGrowth: "-1.1", costOfRevenue: "25,249", grossProfit: "91,360", totalAssets: "165,987", totalLiabilities: "53,015", totalEquity: "112,972", operatingCashFlow: "50,475", investingCashFlow: "-27,957", financingCashFlow: "-27,892", freeCashFlow: "31,506", sga: "31,632", researchDevelopment: "35,338", operatingExpenses: "66,970", operatingIncome: "28,944", netIncome: "23,200", ebitda: "36,909" },
      { period: "2021", revenue: "117,929", revenueGrowth: "37.2", costOfRevenue: "22,649", grossProfit: "95,280", totalAssets: "165,987", totalLiabilities: "47,277", totalEquity: "118,710", operatingCashFlow: "57,683", investingCashFlow: "-18,636", financingCashFlow: "-50,728", freeCashFlow: "39,116", sga: "24,766", researchDevelopment: "24,655", operatingExpenses: "49,421", operatingIncome: "46,753", netIncome: "39,370", ebitda: "54,721" },
      { period: "2020", revenue: "85,965", revenueGrowth: "21.6", costOfRevenue: "16,692", grossProfit: "69,273", totalAssets: "159,316", totalLiabilities: "32,601", totalEquity: "126,715", operatingCashFlow: "38,747", investingCashFlow: "-30,059", financingCashFlow: "-11,092", freeCashFlow: "23,632", sga: "19,573", researchDevelopment: "18,447", operatingExpenses: "38,020", operatingIncome: "32,671", netIncome: "29,146", ebitda: "39,033" },
      { period: "2019", revenue: "70,697", revenueGrowth: "26.6", costOfRevenue: "12,770", grossProfit: "57,927", totalAssets: "133,376", totalLiabilities: "32,601", totalEquity: "100,775", operatingCashFlow: "36,314", investingCashFlow: "-19,864", financingCashFlow: "-7,299", freeCashFlow: "21,212", sga: "15,297", researchDevelopment: "13,600", operatingExpenses: "28,897", operatingIncome: "23,986", netIncome: "18,485", ebitda: "29,773" }
    ]
  }
};