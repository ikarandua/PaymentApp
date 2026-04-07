import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPinEnabled: boolean;
  confirmationResult: any;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setConfirmationResult: (result: any) => void;
  enablePin: () => Promise<void>;
  disablePin: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isPinEnabled: false,
  confirmationResult: null,

  setUser: user =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  setLoading: isLoading => set({ isLoading }),

  setConfirmationResult: confirmationResult => set({ confirmationResult }),

  enablePin: async () => {
    await AsyncStorage.setItem('pinEnabled', 'true');
    set({ isPinEnabled: true });
  },

  disablePin: async () => {
    await AsyncStorage.removeItem('pinEnabled');
    set({ isPinEnabled: false });
  },

  logout: async () => {
    await AsyncStorage.removeItem('pinEnabled');
    set({
      user: null,
      isAuthenticated: false,
      isPinEnabled: false,
    });
  },
}));
