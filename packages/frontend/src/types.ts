export interface User {
  id: string;
  email: string;
}

export interface Entry {
  id: number;
  user_id: string;
  created_at: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  category?: string;
}
