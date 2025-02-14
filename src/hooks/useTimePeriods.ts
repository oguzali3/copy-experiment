
import { useState, useEffect } from "react";
import { formatDateToLongString } from "@/utils/dateFormatters";

export const useTimePeriods = (financialData: any, ticker: string) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sliderValue, setSliderValue] = useState([0, 1]);
  const [timePeriods, setTimePeriods] = useState<string[]>([]);

  useEffect(() => {
    if (financialData && Array.isArray(financialData)) {
      // Filter out TTM entry for sorting
      const regularData = financialData.filter((item: any) => item.period !== 'TTM');
      const ttmData = financialData.find((item: any) => item.period === 'TTM');
      
      // Format and sort periods
      const periods = regularData.map((item: any) => {
        if (item.date) {
          const date = new Date(item.date);
          const year = date.getFullYear();
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          return `Q${quarter} ${year}`;
        }
        return item.period;
      });

      // Remove duplicates and sort
      const uniquePeriods = [...new Set(periods)].sort((a, b) => {
        if (a.includes('Q') && b.includes('Q')) {
          const [aq, ay] = a.split(' ');
          const [bq, by] = b.split(' ');
          const yearDiff = parseInt(ay) - parseInt(by);
          if (yearDiff === 0) {
            return parseInt(aq.slice(1)) - parseInt(bq.slice(1));
          }
          return yearDiff;
        }
        return parseInt(a) - parseInt(b);
      });
      
      // Add TTM if it exists
      if (ttmData) {
        uniquePeriods.push('TTM');
      }
      
      setTimePeriods(uniquePeriods);

      if (uniquePeriods.length > 0) {
        const firstPeriod = uniquePeriods[0];
        const lastPeriod = ttmData ? 'TTM' : uniquePeriods[uniquePeriods.length - 1];

        // Set dates based on periods
        if (firstPeriod.includes('Q')) {
          const [quarter, year] = firstPeriod.split(' ');
          const quarterNum = parseInt(quarter.slice(1));
          const startMonth = (quarterNum - 1) * 3;
          setStartDate(`${new Date(parseInt(year), startMonth + 2, 0).toLocaleString('default', { month: 'long' })} ${year}`);
        } else {
          setStartDate(`December 31, ${firstPeriod}`);
        }

        if (lastPeriod === 'TTM') {
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth();
          const ttmDate = new Date(currentDate.getFullYear(), currentMonth, 0);
          setEndDate(formatDateToLongString(ttmDate));
        } else if (lastPeriod.includes('Q')) {
          const [quarter, year] = lastPeriod.split(' ');
          const quarterNum = parseInt(quarter.slice(1));
          const endMonth = (quarterNum - 1) * 3;
          setEndDate(`${new Date(parseInt(year), endMonth + 2, 0).toLocaleString('default', { month: 'long' })} ${year}`);
        } else {
          setEndDate(`December 31, ${lastPeriod}`);
        }

        setSliderValue([0, uniquePeriods.length - 1]);
      }
    }
  }, [financialData, ticker]);

  const handleSliderChange = (value: number[]) => {
    if (timePeriods.length === 0) return;

    setSliderValue(value);
    const startPeriod = timePeriods[value[0]];
    const endPeriod = timePeriods[value[1]];
    
    if (startPeriod.includes('Q')) {
      const [quarter, year] = startPeriod.split(' ');
      const quarterNum = parseInt(quarter.slice(1));
      const startMonth = (quarterNum - 1) * 3;
      setStartDate(`${new Date(parseInt(year), startMonth + 2, 0).toLocaleString('default', { month: 'long' })} ${year}`);
    } else {
      setStartDate(`December 31, ${startPeriod}`);
    }
    
    if (endPeriod === 'TTM') {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const ttmDate = new Date(currentDate.getFullYear(), currentMonth, 0);
      setEndDate(formatDateToLongString(ttmDate));
    } else if (endPeriod.includes('Q')) {
      const [quarter, year] = endPeriod.split(' ');
      const quarterNum = parseInt(quarter.slice(1));
      const endMonth = (quarterNum - 1) * 3;
      setEndDate(`${new Date(parseInt(year), endMonth + 2, 0).toLocaleString('default', { month: 'long' })} ${year}`);
    } else {
      setEndDate(`December 31, ${endPeriod}`);
    }
  };

  return {
    startDate,
    endDate,
    sliderValue,
    timePeriods,
    handleSliderChange
  };
};
