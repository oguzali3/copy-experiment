
import { Card } from "@/components/ui/card";
import { LineChart, BarChart3, PieChart, DollarSign, TrendingUp } from "lucide-react";

export const DashboardPreview = () => {
  return (
    <div className="w-full max-w-[700px] mx-auto scale-[0.85] sm:scale-90 md:scale-100 shadow-xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
      {/* Mock Header */}
      <div className="bg-white dark:bg-[#1c1c20] h-12 flex items-center px-4 border-b dark:border-gray-800">
        <div className="flex-shrink-0 w-6 h-6 flex flex-row items-end justify-center space-x-0.5">
          <div className="bg-black dark:bg-white h-3 w-1 rounded-sm"></div>
          <div className="bg-black dark:bg-white h-4 w-1 rounded-sm"></div>
        </div>
        <span className="ml-2 font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap overflow-hidden text-sm">Biggr</span>
        
        <div className="ml-auto flex items-center gap-2">
          <div className="w-32 h-6 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="grid grid-cols-12 bg-gray-50 dark:bg-[#1c1c20]">
        {/* Mock Sidebar */}
        <div className="col-span-2 bg-white dark:bg-[#1c1c20] border-r dark:border-gray-800 p-2">
          <div className="flex flex-col items-center space-y-4 py-3">
            {[LineChart, BarChart3, PieChart, TrendingUp, DollarSign].map((Icon, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${index === 0 ? 'bg-blue-50 dark:bg-gray-800 text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="mt-1 w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Mock Dashboard Content */}
        <div className="col-span-10 p-3">
          {/* Market Summary */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white dark:bg-[#2b2b35] p-2 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="h-2.5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-1.5"></div>
                    <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className={`h-2.5 w-12 mt-1 ${item % 2 === 0 ? 'bg-green-200 dark:bg-green-900' : 'bg-red-200 dark:bg-red-900'} rounded-full`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Chart Area */}
          <div className="bg-white dark:bg-[#2b2b35] p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm mb-3">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-full mb-3"></div>
            <div className="h-[100px] w-full relative">
              <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
                <path 
                  d="M0,50 C20,40 40,70 60,60 C80,50 100,30 120,40 C140,50 160,20 180,30 C200,40 220,10 240,20 C260,30 280,60 300,50" 
                  fill="none" 
                  stroke="rgba(59, 130, 246, 0.8)" 
                  strokeWidth="2"
                />
                <path 
                  d="M0,50 C20,40 40,70 60,60 C80,50 100,30 120,40 C140,50 160,20 180,30 C200,40 220,10 240,20 C260,30 280,60 300,50" 
                  fill="url(#gradient)" 
                  opacity="0.2"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          
          {/* Companies Table */}
          <div className="bg-white dark:bg-[#2b2b35] rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="p-3 border-b dark:border-gray-800">
              <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
            <div className="p-2">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-800">
                    <th className="p-2 text-left">
                      <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </th>
                    <th className="p-2 text-left">
                      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </th>
                    <th className="p-2 text-left">
                      <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </th>
                    <th className="p-2 text-right">
                      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded-full ml-auto"></div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((row) => (
                    <tr key={row} className="border-b dark:border-gray-800">
                      <td className="p-2">
                        <div className="flex items-center">
                          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-md mr-2"></div>
                          <div className="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      </td>
                      <td className="p-2">
                        <div className="h-8 w-20">
                          <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path 
                              d={`M0,${15 + Math.random() * 10} ${Array.from({length: 10}, (_, i) => 
                                `L${i * 10},${15 + Math.sin(i) * 10 * Math.random()}`).join(' ')}`}
                              fill="none" 
                              stroke={row % 2 === 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)"}
                              strokeWidth="1.5"
                            />
                          </svg>
                        </div>
                      </td>
                      <td className="p-2 text-right">
                        <div className={`h-3 w-12 ${row % 2 === 0 ? 'bg-green-200 dark:bg-green-900' : 'bg-red-200 dark:bg-red-900'} rounded-full ml-auto`}></div>
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
