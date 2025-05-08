
import { Card } from "@/components/ui/card";
import { LineChart, BarChart3, PieChart, DollarSign, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer } from "recharts";

export const DashboardPreview = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Mock data for mini stock chart
  const chartData = [
    { time: '9:30', price: 145 },
    { time: '10:00', price: 147 },
    { time: '10:30', price: 146 },
    { time: '11:00', price: 148 },
    { time: '11:30', price: 150 },
    { time: '12:00', price: 149 },
    { time: '12:30', price: 151 },
    { time: '13:00', price: 153 },
    { time: '13:30', price: 155 },
    { time: '14:00', price: 154 },
    { time: '14:30', price: 156 },
    { time: '15:00', price: 158 },
    { time: '15:30', price: 157 },
    { time: '16:00', price: 160 }
  ];

  // Mock indices data
  const indexData = [
    { name: "S&P 500", value: "4,930.15", change: "+1.26%", isPositive: true },
    { name: "NASDAQ", value: "15,628.95", change: "+1.54%", isPositive: true },
    { name: "Russell 2000", value: "2,113.78", change: "-0.32%", isPositive: false },
    { name: "FTSE 100", value: "7,889.45", change: "+0.76%", isPositive: true }
  ];

  // Mock company data
  const companyData = [
    { ticker: "AAPL", name: "Apple Inc.", price: "$182.63", change: "+1.2%", isPositive: true, data: generateSparklineData(true) },
    { ticker: "MSFT", name: "Microsoft", price: "$415.32", change: "+0.8%", isPositive: true, data: generateSparklineData(true) },
    { ticker: "GOOGL", name: "Alphabet", price: "$142.65", change: "-0.3%", isPositive: false, data: generateSparklineData(false) },
  ];
  
  // Function to generate random sparkline data
  function generateSparklineData(positiveOverall = true) {
    const points = [];
    let base = 100;
    const trend = positiveOverall ? 2 : -2; // Overall trend direction
    
    for (let i = 0; i < 20; i++) {
      // Add trend + randomness
      base = base + (trend / 10) + (Math.random() - 0.5) * 4;
      points.push(base);
    }
    
    return points;
  }

  return (
    <div className="w-full max-w-[700px] mx-auto scale-[0.85] sm:scale-90 md:scale-100 shadow-xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 transition-all hover:shadow-blue-100/40">
      {/* Mock Header */}
      <div className="bg-white dark:bg-[#1c1c20] h-12 flex items-center px-4 border-b dark:border-gray-800">
        <div className="flex-shrink-0 w-6 h-6 flex flex-row items-end justify-center space-x-0.5">
          <div className="bg-black dark:bg-white h-3 w-1 rounded-sm"></div>
          <div className="bg-black dark:bg-white h-4 w-1 rounded-sm"></div>
        </div>
        <span className="ml-2 font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap overflow-hidden text-sm">StockStream</span>
        
        <div className="ml-auto flex items-center gap-2">
          <div className="w-32 h-6 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="grid grid-cols-12 bg-gray-50 dark:bg-[#1c1c20]">
        {/* Sidebar */}
        <div className="col-span-2 bg-white dark:bg-[#1c1c20] border-r dark:border-gray-800 p-2">
          <div className="flex flex-col items-center space-y-4 py-3">
            {[LineChart, BarChart3, PieChart, TrendingUp, DollarSign].map((Icon, index) => (
              <div 
                key={index} 
                className={`flex flex-col items-center cursor-pointer ${activeTab === index ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
                onClick={() => setActiveTab(index)}
              >
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${index === activeTab ? 'bg-blue-50 dark:bg-gray-800' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="mt-1 text-[10px] font-medium">
                  {index === 0 && "Dashboard"}
                  {index === 1 && "Analytics"}
                  {index === 2 && "Portfolio"}
                  {index === 3 && "Markets"}
                  {index === 4 && "Finance"}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="col-span-10 p-3">
          {/* Market Summary */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {indexData.map((index, idx) => (
              <div key={idx} className="bg-white dark:bg-[#2b2b35] p-2 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{index.name}</div>
                    <div className="text-sm font-semibold dark:text-white">{index.value}</div>
                  </div>
                  <div className={`text-xs ${index.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {index.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Chart Area */}
          <div className="bg-white dark:bg-[#2b2b35] p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm mb-3">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200">AAPL</div>
              <div className="flex gap-2">
                <button className="px-1.5 py-0.5 text-[10px] rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">1D</button>
                <button className="px-1.5 py-0.5 text-[10px] rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">1W</button>
                <button className="px-1.5 py-0.5 text-[10px] rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">1M</button>
              </div>
            </div>
            
            <div className="h-[80px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide={true} />
                  <YAxis hide={true} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#0ea5e9" 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between items-center mt-1">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">$182.63</div>
              <div className="text-xs text-green-500">+$2.14 (1.18%)</div>
            </div>
          </div>
          
          {/* Companies Table */}
          <div className="bg-white dark:bg-[#2b2b35] rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-3 py-2 border-b dark:border-gray-800">
              <div className="text-xs font-medium text-gray-800 dark:text-gray-200">Featured Stocks</div>
            </div>
            <div>
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-800 text-[10px] text-gray-500 dark:text-gray-400">
                    <th className="py-1.5 px-2 text-left">Symbol</th>
                    <th className="py-1.5 px-2 text-left">Company</th>
                    <th className="py-1.5 px-2 text-left">Trend</th>
                    <th className="py-1.5 px-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {companyData.map((company, idx) => (
                    <tr key={idx} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-1.5 px-2 text-xs font-medium text-gray-900 dark:text-gray-200">{company.ticker}</td>
                      <td className="py-1.5 px-2 text-xs text-gray-500 dark:text-gray-400">{company.name}</td>
                      <td className="py-1.5 px-2">
                        <div className="h-[18px]">
                          <svg width="60" height="18" viewBox="0 0 60 18">
                            <path
                              d={`M0,9 ${company.data.map((value, i) => `L${(i * 3)},${18 - value / 10}`).join(" ")}`}
                              fill="none"
                              stroke={company.isPositive ? "#22c55e" : "#ef4444"}
                              strokeWidth="1.5"
                            />
                          </svg>
                        </div>
                      </td>
                      <td className="py-1.5 px-2 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-medium text-gray-900 dark:text-gray-200">{company.price}</span>
                          <span className={`text-[10px] ${company.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {company.change}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
