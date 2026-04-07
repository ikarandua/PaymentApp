import { create } from 'zustand';
import type { Transaction, PaymentRequest } from '../types';

interface WalletState {
  balance: number;
  transactions: Transaction[];
  pendingRequests: PaymentRequest[];
  isLoading: boolean;
  setBalance: (balance: number) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setPendingRequests: (requests: PaymentRequest[]) => void;
  setLoading: (loading: boolean) => void;
  addTransaction: (transaction: Transaction) => void;
  updateRequest: (requestId: string, status: 'accepted' | 'rejected') => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>(set => ({
  balance: 0,
  transactions: [],
  pendingRequests: [],
  isLoading: true,

  setBalance: balance => set({ balance }),

  setTransactions: transactions => set({ transactions }),

  setPendingRequests: pendingRequests => set({ pendingRequests }),

  setLoading: isLoading => set({ isLoading }),

  addTransaction: transaction =>
    set(state => ({
      transactions: [transaction, ...state.transactions],
    })),

  updateRequest: (requestId, status) =>
    set(state => ({
      pendingRequests: state.pendingRequests.filter(r => r.id !== requestId),
    })),

  reset: () =>
    set({
      balance: 0,
      transactions: [],
      pendingRequests: [],
      isLoading: true,
    }),
}));
