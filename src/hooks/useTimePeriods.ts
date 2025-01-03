import { useState, useEffect } from "react";
import { formatDateToLongString } from "@/utils/dateFormatters";

export const useTimePeriods = (financialData: any, ticker: string) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sliderValue, setSliderValue] = useState([0, 4]);
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
        
        // Set initial slider to show last 5 periods or all if less than 5
        const initialEndIndex = years.length - 1;
        const initialStartIndex = Math.max(0, initialEndIndex - 4);
        setSliderValue([initialStartIndex, initialEndIndex]);

        // Set dates based on the selected range
        setStartDate(years[initialStartIndex] === 'TTM' 
          ? formatDateToLongString(new Date()) 
          : `December 31, ${years[initialStartIndex]}`
        );
        
        setEndDate(years[initialEndIndex] === 'TTM'
          ? formatDateToLongString(new Date())
          : `December 31, ${years[initialEndIndex]}`
        );
      }
    }
  }, [financialData, ticker]);

  const handleSliderChange = (value: number[]) => {
    if (timePeriods.length === 0) return;

    setSliderValue(value);
    const startYear = timePeriods[value[0]];
    const endYear = timePeriods[value[1]];
    
    setStartDate(startYear === 'TTM' 
      ? formatDateToLongString(new Date())
      : `December 31, ${startYear}`
    );
    
    setEndDate(endYear === 'TTM'
      ? formatDateToLongString(new Date())
      : `December 31, ${endYear}`
    );
  };

  return {
    startDate,
    endDate,
    sliderValue,
    timePeriods,
    handleSliderChange
  };
};