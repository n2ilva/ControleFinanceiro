import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Salary } from '../types';
import { AuthService } from './authService';

export interface SalaryAdjustment {
  salaryId: string;
  year: number;
  month: number;
  amount: number;
  description?: string;
  userId: string;
}

export const SalaryFirestoreService = {
  // Obter referência da coleção de salários
  getSalariesCollection() {
    return collection(db, 'salaries');
  },

  // Obter referência da coleção de ajustes de salário
  getSalaryAdjustmentsCollection() {
    return collection(db, 'salaryAdjustments');
  },

  // Adicionar salário
  async addSalary(salary: Omit<Salary, 'id'>): Promise<string> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      const salaryData = {
        description: salary.description,
        amount: salary.amount,
        isActive: salary.isActive,
        userId: user.uid,
        createdAt: Timestamp.now(),
        ...(salary.company && { company: salary.company }),
        ...(salary.salaryType && { salaryType: salary.salaryType }),
        ...(salary.originalAmount !== undefined && { originalAmount: salary.originalAmount }),
        ...(salary.paymentDate && { paymentDate: salary.paymentDate }),
        ...(salary.groupId && { groupId: salary.groupId }),
      };

      const docRef = await addDoc(this.getSalariesCollection(), salaryData);

      return docRef.id;
    } catch (error) {
      console.error('Error adding salary:', error);
      throw error;
    }
  },

  // Atualizar salário
  async updateSalary(id: string, updates: Partial<Salary>): Promise<void> {
    try {
      const docRef = doc(db, 'salaries', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating salary:', error);
      throw error;
    }
  },

  // Deletar salário
  async deleteSalary(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'salaries', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting salary:', error);
      throw error;
    }
  },

  // Obter todos os salários do usuário
  async getSalaries(): Promise<Salary[]> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return [];

      const q = query(
        this.getSalariesCollection(),
        where('userId', '==', user.uid)
      );

      const querySnapshot = await getDocs(q);
      const salaries: Salary[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        salaries.push({
          id: doc.id,
          description: data.description,
          ...(data.company && { company: data.company }),
          amount: data.amount,
          ...(data.salaryType && { salaryType: data.salaryType }),
          ...(data.originalAmount !== undefined && { originalAmount: data.originalAmount }),
          ...(data.paymentDate && { paymentDate: data.paymentDate }),
          isActive: data.isActive,
          createdAt: data.createdAt.toDate().toISOString(),
        });
      });

      return salaries;
    } catch (error) {
      console.error('Error getting salaries:', error);
      return [];
    }
  },

  // Obter salários ativos
  async getActiveSalaries(): Promise<Salary[]> {
    try {
      const salaries = await this.getSalaries();
      return salaries.filter(s => s.isActive);
    } catch (error) {
      console.error('Error getting active salaries:', error);
      return [];
    }
  },

  // Obter total de salários ativos
  async getTotalActiveSalaries(): Promise<number> {
    try {
      const activeSalaries = await this.getActiveSalaries();
      return activeSalaries.reduce((sum, s) => sum + s.amount, 0);
    } catch (error) {
      console.error('Error calculating total salaries:', error);
      return 0;
    }
  },

  // Salvar ajuste mensal de salário
  async saveSalaryAdjustment(salaryId: string, year: number, month: number, amount: number, description?: string): Promise<void> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Usar um ID determinístico para facilitar atualizações
      const adjustmentId = `${salaryId}_${year}_${month}`;
      const docRef = doc(db, 'salaryAdjustments', adjustmentId);
      
      await setDoc(docRef, {
        salaryId,
        year,
        month,
        amount,
        ...(description && { description }),
        userId: user.uid,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error saving salary adjustment:', error);
      throw error;
    }
  },

  // Obter ajustes de salário do usuário para um mês específico
  async getSalaryAdjustments(year: number, month: number): Promise<SalaryAdjustment[]> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return [];

      const q = query(
        this.getSalaryAdjustmentsCollection(),
        where('userId', '==', user.uid),
        where('year', '==', year),
        where('month', '==', month)
      );

      const querySnapshot = await getDocs(q);
      const adjustments: SalaryAdjustment[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        adjustments.push({
          salaryId: data.salaryId,
          year: data.year,
          month: data.month,
          amount: data.amount,
          ...(data.description && { description: data.description }),
          userId: data.userId,
        });
      });

      return adjustments;
    } catch (error) {
      console.error('Error getting salary adjustments:', error);
      return [];
    }
  },

  // Obter todos os ajustes de um salário específico
  async getAdjustmentsForSalary(salaryId: string): Promise<SalaryAdjustment[]> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return [];

      const q = query(
        this.getSalaryAdjustmentsCollection(),
        where('userId', '==', user.uid),
        where('salaryId', '==', salaryId)
      );

      const querySnapshot = await getDocs(q);
      const adjustments: SalaryAdjustment[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        adjustments.push({
          salaryId: data.salaryId,
          year: data.year,
          month: data.month,
          amount: data.amount,
          ...(data.description && { description: data.description }),
          userId: data.userId,
        });
      });

      return adjustments;
    } catch (error) {
      console.error('Error getting adjustments for salary:', error);
      return [];
    }
  },

  // Deletar ajuste mensal
  async deleteSalaryAdjustment(salaryId: string, year: number, month: number): Promise<void> {
    try {
      const adjustmentId = `${salaryId}_${year}_${month}`;
      const docRef = doc(db, 'salaryAdjustments', adjustmentId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting salary adjustment:', error);
      throw error;
    }
  },
};
