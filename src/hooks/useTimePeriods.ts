import { useState, useEffect } from "react";
import { formatDateToLongString } from "@/utils/dateFormatters";

export const useTimePeriods = (financialData: any, ticker: string) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sliderValue, setSliderValue] = useState([0, 1]);
  const [timePeriods, setTimePeriods] = useState<string[]>([]);

  useEffect(() => {
    if (financialData && financialData[ticker]?.annual) {
      const annualData = financialData[ticker].annual;
      
      // Filter out TTM entry for sorting
      const regularData = annualData.filter((item: any) => item.period !== 'TTM');
      const ttmData = annualData.find((item: any) => item.period === 'TTM');
      
      // Sort regular data by year in ascending order
      const sortedData = [...regularData].sort((a: any, b: any) => 
        parseInt(a.period) - parseInt(b.period)
      );

      if (sortedData.length > 0) {
        const years = sortedData.map(item => item.period);
        
        // Add TTM if it exists
        if (ttmData) {
          years.push('TTM');
        }
        
        setTimePeriods(years);

        // Set initial dates based on the actual data
        const earliestYear = years[0];
        const latestYear = ttmData ? 'TTM' : years[years.length - 1];

        setStartDate(`December 31, ${earliestYear}`);
        
        if (latestYear === 'TTM') {
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth();
          const ttmDate = new Date(currentDate.getFullYear(), currentMonth, 0);
          setEndDate(formatDateToLongString(ttmDate));
        } else {
          setEndDate(`December 31, ${latestYear}`);
        }

        // Initialize slider with full range
        setSliderValue([0, years.length - 1]);
      }
    }
  }, [financialData, ticker]);

  const handleSliderChange = (value: number[]) => {
    if (timePeriods.length === 0) return;

    setSliderValue(value);
    const startYear = timePeriods[value[0]];
    const endYear = timePeriods[value[1]];
    
    setStartDate(`December 31, ${startYear}`);
    
    if (endYear === 'TTM') {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const ttmDate = new Date(currentDate.getFullYear(), currentMonth, 0);
      setEndDate(formatDateToLongString(ttmDate));
    } else {
      setEndDate(`December 31, ${endYear}`);
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