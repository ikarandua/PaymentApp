import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  increment,
} from '@react-native-firebase/firestore';
import type { User, Transaction, PaymentRequest } from '../types';
import { generateTransactionId } from '../utils/formatters';

const db = getFirestore();

export const createUserProfile = async (
  uid: string,
  phone: string,
  name: string,
): Promise<User> => {
  const userRef = doc(db, 'users', uid);
  const userData: Omit<User, 'createdAt'> & { createdAt: any } = {
    uid,
    phone,
    name,
    balance: 1000,
    createdAt: serverTimestamp(),
  };
  await setDoc(userRef, userData);
  return {
    uid,
    phone,
    name,
    balance: 1000,
    createdAt: new Date(),
  };
};

export const getUserByPhone = async (phone: string): Promise<User | null> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('phone', '==', phone));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const docSnap = snapshot.docs[0];
  const data = docSnap.data();
  return {
    uid: docSnap.id,
    phone: data.phone,
    name: data.name,
    balance: data.balance,
    pin: data.pin,
    createdAt: data.createdAt?.toDate() || new Date(),
    fcmToken: data.fcmToken,
  };
};

export const getUserById = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    uid: snapshot.id,
    phone: data.phone,
    name: data.name,
    balance: data.balance,
    pin: data.pin,
    createdAt: data.createdAt?.toDate() || new Date(),
    fcmToken: data.fcmToken,
  };
};

export const updateUserFcmToken = async (
  uid: string,
  token: string,
): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { fcmToken: token });
};

export const sendMoney = async (
  senderId: string,
  receiverId: string,
  amount: number,
  note?: string,
): Promise<Transaction> => {
  const transactionId = generateTransactionId();
  const senderRef = doc(db, 'users', senderId);
  const receiverRef = doc(db, 'users', receiverId);
  const transactionRef = doc(db, 'transactions', transactionId);

  const sender = await getUserById(senderId);
  const receiver = await getUserById(receiverId);

  if (!sender || !receiver) {
    throw new Error('User not found');
  }

  if (sender.balance < amount) {
    throw new Error('Insufficient balance');
  }

  if (amount <= 0 || amount > 10000) {
    throw new Error('Invalid amount');
  }

  await runTransaction(db, async transaction => {
    const senderDoc = await transaction.get(senderRef);
    const receiverDoc = await transaction.get(receiverRef);

    if (!senderDoc.exists() || !receiverDoc.exists()) {
      throw new Error('User not found');
    }

    const senderBalance = senderDoc.data().balance;
    if (senderBalance < amount) {
      throw new Error('Insufficient balance');
    }

    transaction.update(senderRef, { balance: increment(-amount) });
    transaction.update(receiverRef, { balance: increment(amount) });

    const txData = {
      id: transactionId,
      senderId,
      receiverId,
      senderName: sender.name,
      receiverName: receiver.name,
      senderPhone: sender.phone,
      receiverPhone: receiver.phone,
      amount,
      status: 'completed',
      type: 'sent',
      note: note || '',
      createdAt: serverTimestamp(),
    };

    transaction.set(transactionRef, txData);
  });

  return {
    id: transactionId,
    senderId,
    receiverId,
    senderName: sender.name,
    receiverName: receiver.name,
    senderPhone: sender.phone,
    receiverPhone: receiver.phone,
    amount,
    status: 'completed',
    type: 'sent',
    note: note || '',
    createdAt: new Date(),
  };
};

export const createPaymentRequest = async (
  fromId: string,
  toId: string,
  amount: number,
  note?: string,
): Promise<PaymentRequest> => {
  const fromUser = await getUserById(fromId);
  const toUser = await getUserById(toId);

  if (!fromUser || !toUser) {
    throw new Error('User not found');
  }

  const requestRef = await addDoc(collection(db, 'paymentRequests'), {
    fromId,
    toId,
    fromName: fromUser.name,
    fromPhone: fromUser.phone,
    toName: toUser.name,
    toPhone: toUser.phone,
    amount,
    note: note || '',
    status: 'pending',
    createdAt: serverTimestamp(),
  });

  return {
    id: requestRef.id,
    fromId,
    toId,
    fromName: fromUser.name,
    fromPhone: fromUser.phone,
    toName: toUser.name,
    toPhone: toUser.phone,
    amount,
    note: note || '',
    status: 'pending',
    createdAt: new Date(),
  };
};

export const respondToRequest = async (
  requestId: string,
  request: PaymentRequest,
  accept: boolean,
): Promise<void> => {
  const requestRef = doc(db, 'paymentRequests', requestId);

  if (accept) {
    await sendMoney(
      request.toId,
      request.fromId,
      request.amount,
      `Payment for request: ${request.note}`,
    );
  }

  await updateDoc(requestRef, { status: accept ? 'accepted' : 'rejected' });
};

export const subscribeToTransactions = (
  userId: string,
  callback: (transactions: Transaction[]) => void,
): (() => void) => {
  const transactionsRef = collection(db, 'transactions');
  const q = query(
    transactionsRef,
    where('senderId', '==', userId),
    orderBy('createdAt', 'desc'),
  );

  const unsubscribe = onSnapshot(q, snapshot => {
    const transactions: Transaction[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        senderId: data.senderId,
        receiverId: data.receiverId,
        senderName: data.senderName,
        receiverName: data.receiverName,
        senderPhone: data.senderPhone,
        receiverPhone: data.receiverPhone,
        amount: data.amount,
        status: data.status,
        type: data.senderId === userId ? 'sent' : 'received',
        note: data.note,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });
    callback(transactions);
  });

  return unsubscribe;
};

export const subscribeToPendingRequests = (
  userId: string,
  callback: (requests: PaymentRequest[]) => void,
): (() => void) => {
  const requestsRef = collection(db, 'paymentRequests');
  const q = query(
    requestsRef,
    where('toId', '==', userId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc'),
  );

  const unsubscribe = onSnapshot(q, snapshot => {
    const requests: PaymentRequest[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        fromId: data.fromId,
        toId: data.toId,
        fromName: data.fromName,
        fromPhone: data.fromPhone,
        toName: data.toName,
        toPhone: data.toPhone,
        amount: data.amount,
        note: data.note,
        status: data.status,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });
    callback(requests);
  });

  return unsubscribe;
};

export const subscribeToBalance = (
  userId: string,
  callback: (balance: number) => void,
): (() => void) => {
  const userRef = doc(db, 'users', userId);

  const unsubscribe = onSnapshot(userRef, doc => {
    if (doc.exists()) {
      callback(doc.data().balance);
    }
  });

  return unsubscribe;
};
