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
    id: 'netIncome',
    displayName: 'Net Income',
    type: 'api',
    format: 'currency'
  },
  {
    id: 'netIncomeMargin',
    displayName: 'Net Income Margin',
    type: 'calculated',
    calculation: (current) => {
      if (!current.revenue) return null;
      return (current.netIncome / current.revenue * 100);
    },
    format: 'percentage'
  }
];