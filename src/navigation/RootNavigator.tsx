import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { useAuthStore } from '../stores/authStore';
import SendMoneyScreen from '../screens/payment/SendMoneyScreen';
import RequestMoneyScreen from '../screens/payment/RequestMoneyScreen';
import ConfirmPaymentScreen from '../screens/payment/ConfirmPaymentScreen';
import AddMoneyScreen from '../screens/payment/AddMoneyScreen';
import QRScannerScreen from '../screens/payment/QRScannerScreen';
import PendingRequestsScreen from '../screens/payment/PendingRequestsScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  SendMoney: undefined;
  RequestMoney: undefined;
  ConfirmPayment: {
    recipient: any;
    amount: number;
    note?: string;
    type: 'send' | 'request';
  };
  AddMoney: undefined;
  QRScanner: undefined;
  PendingRequests: undefined;
  TransactionDetail: { transaction: any };
};

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="SendMoney" component={SendMoneyScreen} />
            <Stack.Screen name="RequestMoney" component={RequestMoneyScreen} />
            <Stack.Screen
              name="ConfirmPayment"
              component={ConfirmPaymentScreen}
            />
            <Stack.Screen name="AddMoney" component={AddMoneyScreen} />
            <Stack.Screen name="QRScanner" component={QRScannerScreen} />
            <Stack.Screen
              name="PendingRequests"
              component={PendingRequestsScreen}
            />
            <Stack.Screen
              name="TransactionDetail"
              component={TransactionDetailScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
