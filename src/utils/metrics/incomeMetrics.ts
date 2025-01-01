import { MetricDefinition } from './types';

export const INCOME_METRICS: MetricDefinition[] = [
  {
    id: 'interestExpense',
    displayName: 'Interest Expense',
    type: 'api',
    format: 'currency'
  },
  {
    id: 'interestIncome',
    displayName: 'Interest Income',
    type: 'api',
    format: 'currency'
  },
  {
    id: 'totalOtherIncomeExpensesNet',
    displayName: 'Other Non Operating Income (Expense)',
    type: 'api',
    format: 'currency'
  },
  {
    id: 'incomeBeforeTax',
    displayName: 'Pretax Income',
    type: 'api',
    format: 'currency'
  },
  {
    id: 'incomeBeforeTaxRatio',
    displayName: 'EBT Margin',
    type: 'api',
    format: 'percentage'
  },
  {
    id: 'incomeTaxExpense',
    displayName: 'Income Tax Expense',
    type: 'api',
    format: 'currency'
  },
  {
    id: 'netIncome',
    displayName: 'Net Income',
    type: 'api',
    format: 'currency'
  },
  {
    id: 'netIncomeGrowth',
    displayName: 'Net Income Growth',
    type: 'calculated',
    calculation: (current, previous) => {
      if (!previous?.netIncome || previous.netIncome === 0) return null;
      return ((parseFloat(current.netIncome) - parseFloat(previous.netIncome)) / Math.abs(parseFloat(previous.netIncome))) * 100;
    },
    format: 'percentage'
  },
  {
    id: 'netIncomeMargin',
    displayName: 'Net Income Margin',
    type: 'calculated',
    calculation: (current) => {
      if (!current.revenue) return null;
      return (parseFloat(current.netIncome) / parseFloat(current.revenue) * 100);
    },
    format: 'percentage'
  }
];