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
import { FinancialGoal } from '../types';
import { AuthService } from './authService';
import { GroupService } from './groupService';

export const GoalService = {
  getCollection() {
    return collection(db, 'goals');
  },

  async addGoal(goal: Omit<FinancialGoal, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      const activeGroupId = await GroupService.getActiveGroupId();

      const docRef = await addDoc(this.getCollection(), {
        ...goal,
        userId: user.uid,
        ...(activeGroupId && { groupId: activeGroupId }),
        createdAt: Timestamp.now(),
        ...(goal.deadline && { deadline: Timestamp.fromDate(new Date(goal.deadline)) }),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  },

  async updateGoal(id: string, updates: Partial<FinancialGoal>): Promise<void> {
    try {
      const docRef = doc(db, 'goals', id);
      const updateData: any = { ...updates };
      if (updates.deadline) {
        updateData.deadline = Timestamp.fromDate(new Date(updates.deadline));
      }
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  },

  async deleteGoal(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'goals', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  async getGoals(): Promise<FinancialGoal[]> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return [];

      const activeGroupId = await GroupService.getActiveGroupId();

      const q = activeGroupId
        ? query(this.getCollection(), where('groupId', '==', activeGroupId))
        : query(this.getCollection(), where('userId', '==', user.uid));

      const querySnapshot = await getDocs(q);
      const goals: FinancialGoal[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        goals.push({
          id: docSnap.id,
          title: data.title,
          description: data.description || '',
          targetAmount: data.targetAmount,
          currentAmount: data.currentAmount,
          deadline: data.deadline?.toDate?.().toISOString?.() || data.deadline,
          icon: data.icon || 'flag',
          color: data.color || '#6366F1',
          isCompleted: data.isCompleted || false,
          userId: data.userId,
          ...(data.groupId && { groupId: data.groupId }),
          createdAt: data.createdAt?.toDate?.().toISOString?.() || new Date().toISOString(),
        });
      });

      return goals.sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } catch (error) {
      console.error('Error getting goals:', error);
      return [];
    }
  },

  async addAmountToGoal(id: string, amount: number): Promise<void> {
    try {
      const goals = await this.getGoals();
      const goal = goals.find((g) => g.id === id);
      if (!goal) throw new Error('Meta não encontrada');

      const newAmount = goal.currentAmount + amount;
      const isCompleted = newAmount >= goal.targetAmount;

      await this.updateGoal(id, {
        currentAmount: newAmount,
        isCompleted,
      });
    } catch (error) {
      console.error('Error adding amount to goal:', error);
      throw error;
    }
  },
};
