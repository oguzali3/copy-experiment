export const filterOutTTM = (data: any[]) => {
  return data.filter((item: any) => item.period !== 'TTM');
};

export const filterByTimeRange = (data: any[], startYear: string, endYear: string) => {
  return data.filter((item: any) => {
    if (item.period === 'TTM') {
      return endYear === 'TTM';
    }
    const year = parseInt(item.period);
    const startYearInt = parseInt(startYear);
    const endYearInt = endYear === 'TTM' ? 
      parseInt(data.filter(d => d.period !== 'TTM')
        .sort((a, b) => parseInt(b.period) - parseInt(a.period))[0].period) : 
      parseInt(endYear);
    
    return year >= startYearInt && year <= endYearInt;
  });
};

export const sortChronologically = (data: any[]) => {
  return [...data].sort((a: any, b: any) => {
    if (a.period === 'TTM') return 1;
    if (b.period === 'TTM') return -1;
    return parseInt(a.period) - parseInt(b.period);
  });
};