import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDoc, doc, updateDoc } from '@react-native-firebase/firestore';
import { getFirestore } from '../services/firebase';

const db = getFirestore();

export const savePin = async (uid: string, pin: string): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { pin });
};

export const verifyPin = async (uid: string, pin: string): Promise<boolean> => {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) return false;

  const storedPin = snapshot.data().pin;
  return storedPin === pin;
};

export const hasPin = async (uid: string): Promise<boolean> => {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) return false;

  return !!snapshot.data().pin;
};

export const removePin = async (uid: string): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { pin: null });
};
