export type MonthlyFinance = {
  month: string;
  revenue: number;
  expenses: number;
};

export const monthlyFinance: MonthlyFinance[] = [
  { month: "Mar", revenue: 6200, expenses: 4100 },
  { month: "Apr", revenue: 7100, expenses: 5300 },
  { month: "May", revenue: 8400, expenses: 4800 },
  { month: "Jun", revenue: 9200, expenses: 5600 },
  { month: "Jul", revenue: 10500, expenses: 6100 },
  { month: "Aug", revenue: 11800, expenses: 6900 },
];
