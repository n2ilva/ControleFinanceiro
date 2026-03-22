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
import { Budget } from '../types';
import { AuthService } from './authService';
import { GroupService } from './groupService';

export const BudgetService = {
  getCollection() {
    return collection(db, 'budgets');
  },

  async addBudget(budget: Omit<Budget, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      const activeGroupId = await GroupService.getActiveGroupId();

      const docRef = await addDoc(this.getCollection(), {
        ...budget,
        userId: user.uid,
        ...(activeGroupId && { groupId: activeGroupId }),
        createdAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding budget:', error);
      throw error;
    }
  },

  async updateBudget(id: string, updates: Partial<Budget>): Promise<void> {
    try {
      const docRef = doc(db, 'budgets', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  },

  async deleteBudget(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'budgets', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  },

  async getBudgets(month: number, year: number): Promise<Budget[]> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return [];

      const activeGroupId = await GroupService.getActiveGroupId();

      const q = activeGroupId
        ? query(
            this.getCollection(),
            where('groupId', '==', activeGroupId),
            where('month', '==', month),
            where('year', '==', year),
          )
        : query(
            this.getCollection(),
            where('userId', '==', user.uid),
            where('month', '==', month),
            where('year', '==', year),
          );

      const querySnapshot = await getDocs(q);
      const budgets: Budget[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        budgets.push({
          id: docSnap.id,
          category: data.category,
          limit: data.limit,
          month: data.month,
          year: data.year,
          userId: data.userId,
          ...(data.groupId && { groupId: data.groupId }),
          createdAt: data.createdAt?.toDate?.().toISOString?.() || new Date().toISOString(),
        });
      });

      return budgets.sort((a, b) => a.category.localeCompare(b.category));
    } catch (error) {
      console.error('Error getting budgets:', error);
      return [];
    }
  },

  async copyBudgetsToMonth(
    fromMonth: number,
    fromYear: number,
    toMonth: number,
    toYear: number,
  ): Promise<number> {
    try {
      const existing = await this.getBudgets(toMonth, toYear);
      if (existing.length > 0) return 0; // Não sobrescrever

      const budgets = await this.getBudgets(fromMonth, fromYear);
      let count = 0;

      for (const budget of budgets) {
        await this.addBudget({
          category: budget.category,
          limit: budget.limit,
          month: toMonth,
          year: toYear,
        });
        count++;
      }

      return count;
    } catch (error) {
      console.error('Error copying budgets:', error);
      throw error;
    }
  },
};
