export async function syncFinancialStatements(apiKey: string, supabase: any, period: 'annual' | 'quarter') {
  console.log(`Fetching ${period} financial statements...`);
  const statements = ['income-statement', 'balance-sheet-statement', 'cash-flow-statement'];
  const results: Record<string, number> = {};

  for (const statement of statements) {
    const url = `https://financialmodelingprep.com/api/v4/${statement}-bulk?period=${period}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (Array.isArray(data)) {
      const { error } = await supabase
        .from('financial_statements')
        .upsert(data.map(item => ({
          symbol: item.symbol,
          period: period,
          date: item.date,
          calendar_year: new Date(item.date).getFullYear(),
          ...item
        })));

      if (error) throw error;
      results[statement] = data.length;
    }
  }

  return results;
}