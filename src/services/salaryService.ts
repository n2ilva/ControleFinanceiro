import AsyncStorage from '@react-native-async-storage/async-storage';
import { Salary } from '../types';

const STORAGE_KEY = '@financial_app_salaries';

export const SalaryService = {
  async saveSalaries(salaries: Salary[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(salaries));
    } catch (error) {
      console.error('Error saving salaries:', error);
      throw error;
    }
  },

  async getSalaries(): Promise<Salary[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading salaries:', error);
      return [];
    }
  },

  async addSalary(salary: Salary): Promise<void> {
    try {
      const salaries = await this.getSalaries();
      salaries.push(salary);
      await this.saveSalaries(salaries);
    } catch (error) {
      console.error('Error adding salary:', error);
      throw error;
    }
  },

  async updateSalary(id: string, updates: Partial<Salary>): Promise<void> {
    try {
      const salaries = await this.getSalaries();
      const index = salaries.findIndex(s => s.id === id);
      if (index !== -1) {
        salaries[index] = { ...salaries[index], ...updates };
        await this.saveSalaries(salaries);
      }
    } catch (error) {
      console.error('Error updating salary:', error);
      throw error;
    }
  },

  async deleteSalary(id: string): Promise<void> {
    try {
      const salaries = await this.getSalaries();
      const filtered = salaries.filter(s => s.id !== id);
      await this.saveSalaries(filtered);
    } catch (error) {
      console.error('Error deleting salary:', error);
      throw error;
    }
  },

  async getActiveSalaries(): Promise<Salary[]> {
    try {
      const salaries = await this.getSalaries();
      return salaries.filter(s => s.isActive);
    } catch (error) {
      console.error('Error getting active salaries:', error);
      return [];
    }
  },

  async getTotalActiveSalaries(): Promise<number> {
    try {
      const activeSalaries = await this.getActiveSalaries();
      return activeSalaries.reduce((sum, s) => sum + s.amount, 0);
    } catch (error) {
      console.error('Error calculating total salaries:', error);
      return 0;
    }
  },
};
