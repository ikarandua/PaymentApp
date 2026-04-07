import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

interface TransactionData {
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  amount: number;
  type: string;
  note?: string;
}

interface RequestData {
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
  amount: number;
  note?: string;
  status: string;
}

const sendNotification = async (
  token: string,
  title: string,
  body: string,
  data: Record<string, string>,
): Promise<void> => {
  try {
    await messaging.send({
      token,
      notification: { title, body },
      data,
      android: {
        priority: 'high',
        notification: {
          channelId: 'payment_notifications',
          priority: 'high',
        },
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
          },
        },
      },
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

export const onTransactionCreate = functions.firestore
  .document('transactions/{transactionId}')
  .onCreate(async (snapshot, context) => {
    const transaction = snapshot.data() as TransactionData;

    if (transaction.status !== 'completed') return;

    // Get receiver's FCM token
    const receiverDoc = await db
      .collection('users')
      .doc(transaction.receiverId)
      .get();
    const receiverToken = receiverDoc.data()?.fcmToken;

    if (receiverToken) {
      await sendNotification(
        receiverToken,
        'Payment Received! 💰',
        `You received $${transaction.amount} from ${transaction.senderName}`,
        {
          type: 'payment_received',
          transactionId: context.params.transactionId,
          screen: 'TransactionDetail',
        },
      );
    }

    // Also notify sender
    const senderDoc = await db
      .collection('users')
      .doc(transaction.senderId)
      .get();
    const senderToken = senderDoc.data()?.fcmToken;

    if (senderToken) {
      await sendNotification(
        senderToken,
        'Payment Sent ✓',
        `You sent $${transaction.amount} to ${transaction.receiverName}`,
        {
          type: 'payment_sent',
          transactionId: context.params.transactionId,
          screen: 'TransactionDetail',
        },
      );
    }
  });

export const onRequestCreate = functions.firestore
  .document('paymentRequests/{requestId}')
  .onCreate(async (snapshot, context) => {
    const request = snapshot.data() as RequestData;

    // Get receiver's FCM token
    const receiverDoc = await db.collection('users').doc(request.toId).get();
    const receiverToken = receiverDoc.data()?.fcmToken;

    if (receiverToken) {
      await sendNotification(
        receiverToken,
        'Payment Request Received',
        `${request.fromName} is requesting $${request.amount}${request.note ? `: ${request.note}` : ''}`,
        {
          type: 'request_received',
          requestId: context.params.requestId,
          screen: 'PendingRequests',
        },
      );
    }
  });

export const onRequestUpdate = functions.firestore
  .document('paymentRequests/{requestId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data() as RequestData;
    const after = change.after.data() as RequestData;

    if (before.status !== 'pending' || after.status === 'pending') return;

    // Get requester's FCM token
    const requesterDoc = await db.collection('users').doc(after.fromId).get();
    const requesterToken = requesterDoc.data()?.fcmToken;

    if (!requesterToken) return;

    if (after.status === 'accepted') {
      await sendNotification(
        requesterToken,
        'Request Accepted! 🎉',
        `${after.toName} paid $${after.amount}`,
        {
          type: 'request_accepted',
          requestId: context.params.requestId,
          screen: 'TransactionDetail',
        },
      );
    } else if (after.status === 'rejected') {
      await sendNotification(
        requesterToken,
        'Request Declined',
        `${after.toName} declined your request for $${after.amount}`,
        {
          type: 'request_rejected',
          requestId: context.params.requestId,
          screen: 'Transactions',
        },
      );
    }
  });

export const scheduledBadgeCleanup = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    // Reset notification badges for all users
    // This is a placeholder for badge management
    console.log('Badge cleanup triggered');
  });
