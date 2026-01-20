import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Transaction, MonthlyData } from "../types";
import { AuthService } from "./authService";
import { GroupService } from "./groupService";

export const FirestoreService = {
  // Obter referência da coleção de transações
  getTransactionsCollection() {
    return collection(db, "transactions");
  },

  // Adicionar transação (com suporte a recorrência futura de 12 meses)
  async addTransaction(
    transaction: Omit<Transaction, "id" | "userId">,
  ): Promise<string> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) throw new Error("Usuário não autenticado");

      const activeGroupId = await GroupService.getActiveGroupId();
      const transactionsRef = this.getTransactionsCollection();

      const transactionData = {
        ...transaction,
        userId: user.uid,
        ...(activeGroupId && { groupId: activeGroupId }),
        createdAt: Timestamp.now(),
        date: Timestamp.fromDate(new Date(transaction.date)),
        ...(transaction.dueDate && {
          dueDate: Timestamp.fromDate(new Date(transaction.dueDate)),
        }),
      };

      // Se não for recorrente, comportamento padrão simples
      if (!transaction.isRecurring) {
        const docRef = await addDoc(transactionsRef, transactionData);
        return docRef.id;
      }

      // Se for recorrente, criar para os próximos 12 meses em lote
      const batch = writeBatch(db);

      // Gerar ID de recorrência para agrupar todas
      const recurrenceId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const originalAmount = transaction.amount;
      const baseDate = new Date(transaction.date);

      // ID da primeira transação (mês atual) para retorno
      const mainDocRef = doc(transactionsRef);
      const mainId = mainDocRef.id;

      // Loop para criar 12 transações (atual + 11 futuras)
      for (let i = 0; i < 12; i++) {
        // Calcular data para o mês i
        let newDate = new Date(baseDate);
        newDate.setMonth(baseDate.getMonth() + i);

        // Ajuste fino: Se o dia mudou (ex: era 31 e virou 1/2 ou 3), volta para o último dia do mês anterior
        if (newDate.getDate() !== baseDate.getDate()) {
          newDate.setDate(0); // Último dia do mês anterior
        }

        // Se for a primeira (atual), usa o ID gerado para retorno. As outras, ID auto-gerado.
        const ref = i === 0 ? mainDocRef : doc(transactionsRef);

        const currentTransactionData = {
          ...transactionData,
          recurrenceId,
          originalAmount,
          id: ref.id,
          date: Timestamp.fromDate(newDate),
          // Ajustar data de vencimento se existir
          ...(transaction.dueDate &&
            (() => {
              const baseDueDate = new Date(transaction.dueDate);
              let newDueDate = new Date(baseDueDate);
              newDueDate.setMonth(baseDueDate.getMonth() + i);
              if (newDueDate.getDate() !== baseDueDate.getDate()) {
                newDueDate.setDate(0);
              }
              return { dueDate: Timestamp.fromDate(newDueDate) };
            })()),
        };

        batch.set(ref, currentTransactionData);
      }

      await batch.commit();
      return mainId;
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }
  },

  // Atualizar transação
  async updateTransaction(
    id: string,
    updates: Partial<Transaction>,
  ): Promise<void> {
    try {
      const docRef = doc(db, "transactions", id);
      const updateData: any = { ...updates };

      // Converter datas para Timestamp se necessário
      if (updates.date) {
        updateData.date = Timestamp.fromDate(new Date(updates.date));
      }
      if (updates.dueDate) {
        updateData.dueDate = Timestamp.fromDate(new Date(updates.dueDate));
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  },

  // Deletar transação
  async deleteTransaction(id: string): Promise<void> {
    try {
      const docRef = doc(db, "transactions", id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  },

  // Obter todas as transações do usuário ou grupo
  async getTransactions(): Promise<Transaction[]> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return [];

      const activeGroupId = await GroupService.getActiveGroupId();

      let q;
      if (activeGroupId) {
        // Se tiver grupo ativo, busca transações do grupo
        q = query(
          this.getTransactionsCollection(),
          where("groupId", "==", activeGroupId),
          orderBy("date", "desc"),
        );
      } else {
        // Se não, busca transações pessoais
        q = query(
          this.getTransactionsCollection(),
          where("userId", "==", user.uid),
          orderBy("date", "desc"),
        );
      }

      const querySnapshot = await getDocs(q);
      const transactions: Transaction[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          description: data.description,
          amount: data.amount,
          category: data.category,
          isRecurring: data.isRecurring,
          isPaid: data.isPaid,
          type: data.type,
          date: data.date.toDate().toISOString(),
          createdAt: data.createdAt.toDate().toISOString(),
          ...(data.isSalary && { isSalary: data.isSalary }),
          ...(data.dueDate && { dueDate: data.dueDate.toDate().toISOString() }),
          ...(data.recurrenceId && { recurrenceId: data.recurrenceId }),
          ...(data.originalAmount && { originalAmount: data.originalAmount }),
        });
      });

      return transactions;
    } catch (error) {
      console.error("Error getting transactions:", error);
      return [];
    }
  },

  // Obter dados mensais
  async getMonthlyData(month: number, year: number): Promise<MonthlyData> {
    try {
      const transactions = await this.getTransactions();

      const monthTransactions = transactions.filter((t) => {
        const date = new Date(t.date);
        return date.getMonth() === month && date.getFullYear() === year;
      });

      const totalExpenses = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      const totalIncome = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: new Date(year, month).toLocaleString("pt-BR", { month: "long" }),
        year,
        transactions: monthTransactions,
        totalExpenses,
        totalIncome,
        balance: totalIncome - totalExpenses,
      };
    } catch (error) {
      console.error("Error getting monthly data:", error);
      throw error;
    }
  },

  // Duplicar transações recorrentes
  // NOTA: Com a nova lógica de criar 12 meses adiantado, esta função pode ser menos usada,
  // mas mantemos para casos legados ou extensão manual além de 12 meses
  async duplicateRecurringTransactions(
    fromMonth: number,
    fromYear: number,
    toMonth: number,
    toYear: number,
  ): Promise<void> {
    try {
      const allTransactions = await this.getTransactions();
      const recurringTransactions = allTransactions.filter((t) => {
        const date = new Date(t.date);
        return (
          t.isRecurring &&
          date.getMonth() === fromMonth &&
          date.getFullYear() === fromYear
        );
      });

      for (const t of recurringTransactions) {
        // Evitar duplicar se já foi gerada pela lógica de 12 meses (verificar se já existe no destino??)
        // Por simplicidade, assumir que essa função é chamada explicitamente pelo usuário

        const newTransaction: Omit<Transaction, "id" | "userId"> = {
          description: t.description,
          amount: t.amount,
          category: t.category,
          isRecurring: t.isRecurring,
          isPaid: false,
          type: t.type,
          date: new Date(
            toYear,
            toMonth,
            new Date(t.date).getDate(),
          ).toISOString(),
          createdAt: new Date().toISOString(),
          ...(t.isSalary && { isSalary: t.isSalary }),
          ...(t.dueDate && {
            dueDate: new Date(
              toYear,
              toMonth,
              new Date(t.dueDate).getDate(),
            ).toISOString(),
          }),
        };

        await this.addTransaction(newTransaction);
      }
    } catch (error) {
      console.error("Error duplicating recurring transactions:", error);
      throw error;
    }
  },
};
