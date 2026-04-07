import { initializeApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore as modularGetFirestore } from '@react-native-firebase/firestore';
import { getMessaging } from '@react-native-firebase/messaging';
import { getFunctions } from '@react-native-firebase/functions';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

let initialized = false;

export const initFirebase = async (): Promise<void> => {
  if (!initialized) {
    await initializeApp(firebaseConfig);
    initialized = true;
  }
};

export { getAuth, getMessaging, getFunctions };
export const getFirestore = modularGetFirestore;
