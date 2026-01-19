
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
  password?: string;
  lastLogin: string;
  isAdmin?: boolean;
}

export interface BusinessConfig {
  companyName: string;
  industry: string;
  currency: string;
  language: 'bn' | 'en';
  targetProfitMargin?: number;
  useMarginEstimation?: boolean;
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

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  currentBalance: number; // Positive means they owe us (Due), Negative means they have advance
}

export interface Payment {
  id: string;
  customerId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Sale {
  id: string;
  amount: number;
  date: string;
  note?: string;
  billNumber?: string;
  stockItemId?: string;
  quantity?: number;
  customerId?: string; // Linked to customer
  isCredit: boolean; // If true, added to customer balance
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
  customers: Customer[];
  payments: Payment[];
}

export type ViewType = 'dashboard' | 'sales' | 'expenses' | 'inventory' | 'reports' | 'settings' | 'customers' | 'stock-entry';
