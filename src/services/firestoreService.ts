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
import { Transaction, MonthlyData, Salary } from "../types";
import { AuthService } from "./authService";
import { GroupService } from "./groupService";
import { SalaryFirestoreService, SalaryAdjustment } from "./salaryFirestoreService";

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
        ...(transaction.receivedDate && {
          receivedDate: Timestamp.fromDate(new Date(transaction.receivedDate)),
        }),
      };

      // Adicionar transação normalmente (não criar automaticamente 12 meses)
      // A lógica de recorrência agora é tratada na tela de adicionar
      const docRef = await addDoc(transactionsRef, transactionData);
      return docRef.id;
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

  // Cancelar recorrência - remove transações futuras e marca a atual como não recorrente
  async cancelRecurrence(
    transactionId: string,
    recurrenceId: string,
    currentTransactionDate: string,
  ): Promise<number> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) throw new Error("User not authenticated");

      const activeGroupId = await GroupService.getActiveGroupId();
      const currentDate = new Date(currentTransactionDate);

      // Buscar todas as transações com o mesmo recurrenceId
      let q;
      if (activeGroupId) {
        q = query(
          this.getTransactionsCollection(),
          where("groupId", "==", activeGroupId),
          where("recurrenceId", "==", recurrenceId),
        );
      } else {
        q = query(
          this.getTransactionsCollection(),
          where("userId", "==", user.uid),
          where("recurrenceId", "==", recurrenceId),
        );
      }

      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      let deletedCount = 0;

      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const transactionDate = data.date.toDate();

        // Se a data for APÓS o mês atual, deletar
        if (transactionDate > currentDate) {
          batch.delete(docSnapshot.ref);
          deletedCount++;
        }
        // Se for a transação atual, marcar como não recorrente
        else if (docSnapshot.id === transactionId) {
          batch.update(docSnapshot.ref, { isRecurring: false });
        }
      });

      await batch.commit();
      return deletedCount;
    } catch (error) {
      console.error("Error canceling recurrence:", error);
      throw error;
    }
  },

  // Excluir transações recorrentes a partir de uma data (inclusive)
  async deleteRecurrenceFromDate(
    recurrenceId: string,
    fromDate: string,
  ): Promise<number> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) throw new Error("User not authenticated");

      const activeGroupId = await GroupService.getActiveGroupId();
      const fromDateObj = new Date(fromDate);

      // Buscar todas as transações com o mesmo recurrenceId
      let q;
      if (activeGroupId) {
        q = query(
          this.getTransactionsCollection(),
          where("groupId", "==", activeGroupId),
          where("recurrenceId", "==", recurrenceId),
        );
      } else {
        q = query(
          this.getTransactionsCollection(),
          where("userId", "==", user.uid),
          where("recurrenceId", "==", recurrenceId),
        );
      }

      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      let deletedCount = 0;

      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const transactionDate = data.date.toDate();

        // Se a data for igual ou APÓS a data informada, deletar
        if (transactionDate >= fromDateObj) {
          batch.delete(docSnapshot.ref);
          deletedCount++;
        }
      });

      await batch.commit();
      return deletedCount;
    } catch (error) {
      console.error("Error deleting recurrence from date:", error);
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
        
        // Converter receivedDate de forma segura (pode ser Timestamp ou string)
        let receivedDateISO: string | undefined;
        if (data.receivedDate) {
          if (typeof data.receivedDate.toDate === 'function') {
            receivedDateISO = data.receivedDate.toDate().toISOString();
          } else if (typeof data.receivedDate === 'string') {
            receivedDateISO = data.receivedDate;
          }
        }
        
        transactions.push({
          id: doc.id,
          description: data.description,
          amount: data.amount,
          category: data.category,
          isRecurring: data.isRecurring,
          isPaid: true,
          type: data.type,
          date: data.date.toDate().toISOString(),
          createdAt: data.createdAt.toDate().toISOString(),
          ...(data.isSalary && { isSalary: data.isSalary }),
          ...(data.dueDate && { dueDate: data.dueDate.toDate().toISOString() }),
          ...(receivedDateISO && { receivedDate: receivedDateISO }),
          ...(data.cardId !== undefined && { cardId: data.cardId }),
          ...(data.cardName !== undefined && { cardName: data.cardName }),
          ...(data.cardType !== undefined && { cardType: data.cardType }),
          ...(data.recurrenceId && { recurrenceId: data.recurrenceId }),
          ...(data.originalAmount !== undefined && { originalAmount: data.originalAmount }),
          ...(data.installments !== undefined && { installments: data.installments }),
          ...(data.installmentNumber !== undefined && { installmentNumber: data.installmentNumber }),
        });
      });

      return transactions;
    } catch (error) {
      console.error("Error getting transactions:", error);
      return [];
    }
  },

  // Calcular dados mensais a partir de um snapshot único de dados
  calculateMonthlyData(
    month: number,
    year: number,
    transactions: Transaction[],
    activeSalaries: Salary[],
    salaryAdjustments: SalaryAdjustment[],
    today: Date,
  ): MonthlyData {
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const salaryTransactions: Transaction[] = activeSalaries
      .map((salary) => {
        let day = 1;
        if (salary.paymentDate) {
          const match = salary.paymentDate.match(/(\d{2})\/(\d{2})\/(\d{4})/);
          if (match) {
            day = parseInt(match[1]);
          } else {
            const parsed = new Date(salary.paymentDate);
            if (!isNaN(parsed.getTime())) {
              day = parsed.getDate();
            }
          }
        }

        const dateObj = new Date(year, month, day);
        if (dateObj.getMonth() !== month) {
          dateObj.setDate(0);
        }

        const isCurrentMonth = month === currentMonth && year === currentYear;
        const isPastMonth = year < currentYear || (year === currentYear && month < currentMonth);
        const isFutureMonth = year > currentYear || (year === currentYear && month > currentMonth);

        const paymentDay = dateObj.getDate();
        const shouldShow = isPastMonth || (isCurrentMonth && currentDay >= paymentDay);

        if (isFutureMonth || !shouldShow) {
          return null;
        }

        const adjustment = salaryAdjustments.find((adj) => adj.salaryId === salary.id);
        const adjustedAmount = adjustment ? adjustment.amount : salary.amount;

        return {
          id: `salary_${salary.id}_${year}_${month}`,
          description: adjustment?.description || salary.company || salary.description,
          amount: adjustedAmount,
          originalAmount: salary.amount,
          category: salary.salaryType === "salary" ? "salario" : "extra",
          isRecurring: true,
          isPaid: true,
          type: "income",
          date: dateObj.toISOString(),
          createdAt: salary.createdAt,
          isSalary: true,
          userId: salary.userId,
        };
      })
      .filter((t): t is Transaction => t !== null);

    const monthTransactions = [...transactions, ...salaryTransactions].filter((t) => {
      const date = new Date(t.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    const totalExpenses = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = monthTransactions
      .filter((t) => {
        if (t.type !== "income") return false;

        if (t.isSalary) return true;

        if (t.receivedDate) {
          const receivedDateObj = new Date(t.receivedDate);
          const receivedDay = receivedDateObj.getDate();

          const isCurrentMonth = month === currentMonth && year === currentYear;
          const isPastMonth = year < currentYear || (year === currentYear && month < currentMonth);
          const isFutureMonth = year > currentYear || (year === currentYear && month > currentMonth);

          if (isFutureMonth) return false;
          if (isPastMonth) return true;

          return isCurrentMonth && currentDay >= receivedDay;
        }

        return true;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      month: new Date(year, month).toLocaleString("pt-BR", { month: "long" }),
      year,
      transactions: monthTransactions,
      totalExpenses,
      totalIncome,
      balance: totalIncome - totalExpenses,
    };
  },

  // Obter dados mensais
  async getMonthlyData(month: number, year: number): Promise<MonthlyData> {
    try {
      const transactions = await this.getTransactions();
      const activeSalaries = await SalaryFirestoreService.getActiveSalaries();
      const salaryAdjustments = await SalaryFirestoreService.getSalaryAdjustments(year, month);
      return this.calculateMonthlyData(
        month,
        year,
        transactions,
        activeSalaries,
        salaryAdjustments,
        new Date(),
      );
    } catch (error) {
      console.error("Error getting monthly data:", error);
      throw error;
    }
  },

  // Obter dados do mês atual e do mês anterior usando o mesmo snapshot de dados
  async getMonthlyDataWithPrevious(month: number, year: number): Promise<{
    current: MonthlyData;
    previous: MonthlyData;
  }> {
    try {
      let prevMonth = month - 1;
      let prevYear = year;
      if (prevMonth < 0) {
        prevMonth = 11;
        prevYear = year - 1;
      }

      let prevPrevMonth = prevMonth - 1;
      let prevPrevYear = prevYear;
      if (prevPrevMonth < 0) {
        prevPrevMonth = 11;
        prevPrevYear = prevYear - 1;
      }

      const [transactions, activeSalaries, currentAdjustments, previousAdjustments, prevPreviousAdjustments] =
        await Promise.all([
          this.getTransactions(),
          SalaryFirestoreService.getActiveSalaries(),
          SalaryFirestoreService.getSalaryAdjustments(year, month),
          SalaryFirestoreService.getSalaryAdjustments(prevYear, prevMonth),
          SalaryFirestoreService.getSalaryAdjustments(prevPrevYear, prevPrevMonth),
        ]);

      const now = new Date();

      const previousRaw = this.calculateMonthlyData(
        prevMonth,
        prevYear,
        transactions,
        activeSalaries,
        previousAdjustments,
        now,
      );

      const prevPreviousRaw = this.calculateMonthlyData(
        prevPrevMonth,
        prevPrevYear,
        transactions,
        activeSalaries,
        prevPreviousAdjustments,
        now,
      );

      // Saldo final do mês anterior (como exibido no mês anterior):
      // saldo base do mês + carry-over do mês anterior a ele
      const previous: MonthlyData = {
        ...previousRaw,
        totalIncome: previousRaw.totalIncome + prevPreviousRaw.balance,
        balance: previousRaw.totalIncome + prevPreviousRaw.balance - previousRaw.totalExpenses,
      };

      const current = this.calculateMonthlyData(
        month,
        year,
        transactions,
        activeSalaries,
        currentAdjustments,
        now,
      );

      // Regra de negócio: carregar o saldo do mês anterior como receita no mês atual
      const currentWithCarryOver: MonthlyData = {
        ...current,
        totalIncome: current.totalIncome + previous.balance,
        balance: current.totalIncome + previous.balance - current.totalExpenses,
      };

      return { current: currentWithCarryOver, previous };
    } catch (error) {
      console.error("Error getting current and previous monthly data:", error);
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

        // Calcular data segura para o mês destino
        const originalDate = new Date(t.date);
        const lastDayOfToMonth = new Date(toYear, toMonth + 1, 0).getDate();
        const safeDay = Math.min(originalDate.getDate(), lastDayOfToMonth);

        const newTransaction: Omit<Transaction, "id" | "userId"> = {
          description: t.description,
          amount: t.amount,
          category: t.category,
          isRecurring: t.isRecurring,
          isPaid: false,
          type: t.type,
          date: new Date(toYear, toMonth, safeDay).toISOString(),
          createdAt: new Date().toISOString(),
          ...(t.isSalary && { isSalary: t.isSalary }),
          ...(t.dueDate && {
            dueDate: (() => {
              const originalDueDate = new Date(t.dueDate);
              const lastDayDue = new Date(toYear, toMonth + 1, 0).getDate();
              const safeDueDay = Math.min(originalDueDate.getDate(), lastDayDue);
              return new Date(toYear, toMonth, safeDueDay).toISOString();
            })(),
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
