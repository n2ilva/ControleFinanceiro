export interface Transaction {
  id: string;
  description: string;
  amount: number;
  isRecurring: boolean;
  isPaid: boolean;
  category: string;
  date: string;
  type: 'expense' | 'income';
  createdAt: string;
  isSalary?: boolean;
  dueDate?: string;
  userId: string; // Quem criou
  groupId?: string; // Grupo compartilhado
  recurrenceId?: string; // ID compartilhado entre transações recorrentes geradas juntas
  originalAmount?: number; // Valor original da recorrência (para comparar e destacar mudanças)
}

export interface MonthlyData {
  month: string;
  year: number;
  transactions: Transaction[];
  totalExpenses: number;
  totalIncome: number;
  balance: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface Salary {
  id: string;
  description: string;
  amount: number;
  isActive: boolean;
  createdAt: string;
  userId: string;
  groupId?: string;
}

export interface Group {
  id: string;
  name: string;
  code: string; // Código de 6 dígitos para compartilhar
  ownerId: string;
  members: string[]; // Array de user IDs
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  groupIds: string[]; // Array de IDs de grupos
  activeGroupId?: string; // Grupo atualmente ativo
  createdAt: string;
}
