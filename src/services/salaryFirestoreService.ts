import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Salary } from '../types';
import { AuthService } from './authService';

export const SalaryFirestoreService = {
  // Obter referência da coleção de salários
  getSalariesCollection() {
    return collection(db, 'salaries');
  },

  // Adicionar salário
  async addSalary(salary: Omit<Salary, 'id'>): Promise<string> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      const docRef = await addDoc(this.getSalariesCollection(), {
        ...salary,
        userId: user.uid,
        createdAt: Timestamp.now(),
      });

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
          amount: data.amount,
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
};
