import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

interface SettingsState {
  theme: Theme;
  isDarkMode: boolean;
  setTheme: (theme: Theme) => Promise<void>;
  checkDarkMode: () => Promise<boolean>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'system',
  isDarkMode: false,

  setTheme: async theme => {
    await AsyncStorage.setItem('theme', theme);
    set({ theme });
    if (theme === 'dark') {
      set({ isDarkMode: true });
    } else if (theme === 'light') {
      set({ isDarkMode: false });
    } else {
      await get().checkDarkMode();
    }
  },

  checkDarkMode: async () => {
    const storedTheme = await AsyncStorage.getItem('theme');
    if (storedTheme === 'dark') {
      set({ isDarkMode: true, theme: 'dark' });
      return true;
    } else if (storedTheme === 'light') {
      set({ isDarkMode: false, theme: 'light' });
      return false;
    }
    set({ theme: 'system' });
    return false;
  },
}));
