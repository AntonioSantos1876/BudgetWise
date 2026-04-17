export interface Profile {
  id: string;
  display_name: string;
  avatar: string;
  primary_currency: string;
  secondary_currency: string;
  rate_mode: 'live' | 'manual';
  manual_rate: number;
  monthly_income: number;
  theme: 'dark' | 'light' | 'system';
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  category: string;
  note?: string;
  date: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  month: string;
  category: string;
  allocated: number;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
}

export interface CurrencyRate {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

export interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  allocations: Record<string, number>;
}
