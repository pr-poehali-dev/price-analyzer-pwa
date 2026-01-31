export interface Comparison {
  id: string;
  date: string;
  priceX: number;
  weightX: number;
  priceY: number;
  weightY: number;
  pricePerGramX: number;
  pricePerGramY: number;
  betterOption: 'X' | 'Y';
  savingsPercent: number;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  comment?: string;
}

export interface CategoryStats {
  category: string;
  total: number;
  percentage: number;
  color: string;
}
