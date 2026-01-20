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
import { CreditCard } from '../types';
import { AuthService } from './authService';
import { GroupService } from './groupService';

export const CreditCardFirestoreService = {
  getCreditCardsCollection() {
    return collection(db, 'creditCards');
  },

  async addCreditCard(card: Omit<CreditCard, 'id' | 'userId'>): Promise<string> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      const activeGroupId = await GroupService.getActiveGroupId();

      const docRef = await addDoc(this.getCreditCardsCollection(), {
        ...card,
        userId: user.uid,
        ...(activeGroupId && { groupId: activeGroupId }),
        createdAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding credit card:', error);
      throw error;
    }
  },

  async updateCreditCard(id: string, updates: Partial<CreditCard>): Promise<void> {
    try {
      const docRef = doc(db, 'creditCards', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating credit card:', error);
      throw error;
    }
  },

  async deleteCreditCard(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'creditCards', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting credit card:', error);
      throw error;
    }
  },

  async getCreditCards(): Promise<CreditCard[]> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return [];

      const activeGroupId = await GroupService.getActiveGroupId();

      const q = activeGroupId
        ? query(this.getCreditCardsCollection(), where('groupId', '==', activeGroupId))
        : query(this.getCreditCardsCollection(), where('userId', '==', user.uid));

      const querySnapshot = await getDocs(q);
      const cards: CreditCard[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        cards.push({
          id: docSnap.id,
          name: data.name,
          dueDay: data.dueDay,
          cardType: data.cardType,
          createdAt: data.createdAt?.toDate?.().toISOString?.() || new Date().toISOString(),
          userId: data.userId,
          ...(data.groupId && { groupId: data.groupId }),
        });
      });

      // Ordenar por nome para facilitar seleção
      return cards.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error getting credit cards:', error);
      return [];
    }
  },
};
