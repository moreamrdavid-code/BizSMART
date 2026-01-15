
export enum ExpenseType {
  SALARY = 'Staff Salary',
  RENT = 'Shop Rent',
  ELECTRICITY = 'Electricity Bill',
  MARKETING = 'Marketing',
  UTILITIES = 'Utilities',
  OTHER = 'Other'
}

export interface User {
  username: string;
  password?: string; // Only stored in registry
  lastLogin: string;
}

export interface BusinessConfig {
  companyName: string;
  industry: string;
  targetProfitMargin: number; // Percentage
  useMarginEstimation: boolean; // Toggle for showing estimated profit
  currency: string;
  language: 'bn' | 'en';
}

export interface StockItem {
  id: string;
  name: string;
  sku?: string;
  initialQuantity: number;
  currentQuantity: number;
  purchasePrice: number;
  sellingPrice: number;
}

export interface Sale {
  id: string;
  amount: number;
  date: string;
  note?: string;
  stockItemId?: string;
  quantity?: number;
}

export interface Expense {
  id: string;
  amount: number;
  type: ExpenseType;
  date: string;
  description: string;
}

export interface BusinessData {
  config: BusinessConfig | null;
  sales: Sale[];
  expenses: Expense[];
  inventory: StockItem[];
}

export type ViewType = 'dashboard' | 'sales' | 'expenses' | 'inventory' | 'reports' | 'settings';
