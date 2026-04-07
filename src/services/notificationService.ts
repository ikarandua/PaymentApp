import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUserFcmToken } from './paymentService';

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    }

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    return enabled;
  } catch (error) {
    console.log('Permission error:', error);
    return false;
  }
};

export const getFcmToken = async (): Promise<string | null> => {
  try {
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.log('FCM Token error:', error);
    return null;
  }
};

export const subscribeToForegroundMessages = (
  onMessage: (message: any) => void,
): (() => void) => {
  return messaging().onMessage(async remoteMessage => {
    onMessage(remoteMessage);
  });
};

export const setBackgroundMessageHandler = (): void => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background message:', remoteMessage);
  });
};

export const onNotificationTap = (
  navigationRef: any,
  onNotificationReceived: (notification: any) => void,
): (() => void) => {
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification caused app to open:', remoteMessage);
    handleNotificationNavigation(navigationRef, remoteMessage);
  });

  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('App opened from quit state via notification');
        handleNotificationNavigation(navigationRef, remoteMessage);
      }
    });

  return subscribeToForegroundMessages(onNotificationReceived);
};

const handleNotificationNavigation = (
  navigationRef: any,
  remoteMessage: any,
): void => {
  const { data } = remoteMessage;

  if (!navigationRef || !navigationRef.isReady()) return;

  const screen = data?.screen;

  switch (screen) {
    case 'TransactionDetail':
      navigationRef.navigate('MainTabs', {
        screen: 'Transactions',
        params: {
          screen: 'TransactionDetail',
          params: { transactionId: data?.transactionId },
        },
      });
      break;
    case 'PendingRequests':
      navigationRef.navigate('MainTabs', {
        screen: 'Transactions',
        params: { screen: 'PendingRequests' },
      });
      break;
    default:
      navigationRef.navigate('MainTabs');
  }
};

export const saveNotification = async (notification: any): Promise<void> => {
  try {
    const existing = await AsyncStorage.getItem('notifications');
    const notifications = existing ? JSON.parse(existing) : [];
    notifications.unshift({
      ...notification,
      read: false,
      createdAt: new Date().toISOString(),
    });
    await AsyncStorage.setItem(
      'notifications',
      JSON.stringify(notifications.slice(0, 50)),
    );
  } catch (error) {
    console.log('Error saving notification:', error);
  }
};

export const getNotifications = async (): Promise<any[]> => {
  try {
    const existing = await AsyncStorage.getItem('notifications');
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.log('Error getting notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  try {
    const existing = await AsyncStorage.getItem('notifications');
    if (!existing) return;

    const notifications = JSON.parse(existing);
    const updated = notifications.map((n: any) =>
      n.id === id ? { ...n, read: true } : n,
    );
    await AsyncStorage.setItem('notifications', JSON.stringify(updated));
  } catch (error) {
    console.log('Error marking notification as read:', error);
  }
};
