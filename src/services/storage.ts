import { Comparison, Expense } from '@/types';

const COMPARISONS_KEY = 'price_comparisons';
const EXPENSES_KEY = 'expenses';
const CATEGORIES_KEY = 'expense_categories';

const DEFAULT_CATEGORIES = [
  'Продукты',
  'Мясо и рыба',
  'Овощи и фрукты',
  'Молочное',
  'Хлеб и выпечка',
  'Напитки',
  'Снеки',
  'Другое'
];

export const storageService = {
  getComparisons(): Comparison[] {
    const data = localStorage.getItem(COMPARISONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveComparison(comparison: Comparison): void {
    const comparisons = this.getComparisons();
    comparisons.unshift(comparison);
    localStorage.setItem(COMPARISONS_KEY, JSON.stringify(comparisons));
  },

  deleteComparison(id: string): void {
    const comparisons = this.getComparisons().filter(c => c.id !== id);
    localStorage.setItem(COMPARISONS_KEY, JSON.stringify(comparisons));
  },

  getExpenses(): Expense[] {
    const data = localStorage.getItem(EXPENSES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveExpense(expense: Expense): void {
    const expenses = this.getExpenses();
    expenses.unshift(expense);
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  },

  deleteExpense(id: string): void {
    const expenses = this.getExpenses().filter(e => e.id !== id);
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  },

  getCategories(): string[] {
    const data = localStorage.getItem(CATEGORIES_KEY);
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
  },

  addCategory(category: string): void {
    const categories = this.getCategories();
    if (!categories.includes(category)) {
      categories.push(category);
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    }
  }
};
