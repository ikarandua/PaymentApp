import React, { useEffect, useState } from 'react';
import { StatusBar, ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/stores/authStore';
import { useSettingsStore } from './src/stores/settingsStore';
import { initFirebase } from './src/services/firebase';
import { getUserById } from './src/services/paymentService';

const App: React.FC = () => {
  const [initializing, setInitializing] = useState(true);
  const { user, setUser, setLoading } = useAuthStore();
  const { checkDarkMode } = useSettingsStore();

  useEffect(() => {
    const initialize = async () => {
      try {
        await initFirebase();
        await checkDarkMode();

        const { getAuth } = await import('./src/services/firebase');
        const auth = getAuth();

        const { onAuthStateChanged } =
          await import('@react-native-firebase/auth');

        onAuthStateChanged(auth, async firebaseUser => {
          if (firebaseUser) {
            const userData = await getUserById(firebaseUser.uid);
            if (userData) {
              setUser(userData);
            }
          } else {
            setUser(null);
          }
          setLoading(false);
          setInitializing(false);
        });
      } catch (error) {
        console.log('Initialization error:', error);
        setLoading(false);
        setInitializing(false);
      }
    };

    initialize();
  }, []);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default App;
