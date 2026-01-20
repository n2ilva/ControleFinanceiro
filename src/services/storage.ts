import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, MonthlyData } from '../types';

const STORAGE_KEY = '@financial_app_transactions';

export const StorageService = {
  async saveTransactions(transactions: Transaction[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
      throw error;
    }
  },

  async getTransactions(): Promise<Transaction[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  },

  async addTransaction(transaction: Transaction): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      transactions.push(transaction);
      await this.saveTransactions(transactions);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      const index = transactions.findIndex(t => t.id === id);
      if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updates };
        await this.saveTransactions(transactions);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  async deleteTransaction(id: string): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      const filtered = transactions.filter(t => t.id !== id);
      await this.saveTransactions(filtered);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

  async getMonthlyData(month: number, year: number): Promise<MonthlyData> {
    try {
      const allTransactions = await this.getTransactions();
      const monthTransactions = allTransactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === month && date.getFullYear() === year;
      });

      const totalExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: new Date(year, month).toLocaleString('pt-BR', { month: 'long' }),
        year,
        transactions: monthTransactions,
        totalExpenses,
        totalIncome,
        balance: totalIncome - totalExpenses,
      };
    } catch (error) {
      console.error('Error getting monthly data:', error);
      throw error;
    }
  },

  async duplicateRecurringTransactions(fromMonth: number, fromYear: number, toMonth: number, toYear: number): Promise<void> {
    try {
      const allTransactions = await this.getTransactions();
      const recurringTransactions = allTransactions.filter(t => {
        const date = new Date(t.date);
        return t.isRecurring && date.getMonth() === fromMonth && date.getFullYear() === fromYear;
      });

      const newTransactions = recurringTransactions.map(t => ({
        ...t,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: new Date(toYear, toMonth, new Date(t.date).getDate()).toISOString(),
        isPaid: false,
        createdAt: new Date().toISOString(),
      }));

      const updatedTransactions = [...allTransactions, ...newTransactions];
      await this.saveTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error duplicating recurring transactions:', error);
      throw error;
    }
  },
};
