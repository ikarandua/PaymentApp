import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PendingRequestsScreen from '../screens/payment/PendingRequestsScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';

export type MainTabParamList = {
  Home: undefined;
  Transactions: undefined;
  Profile: undefined;
};

export type TransactionsStackParamList = {
  TransactionsList: undefined;
  TransactionDetail: { transaction: any };
  PendingRequests: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon: React.FC<{ name: string; focused: boolean }> = ({
  name,
  focused,
}) => {
  const icons: Record<string, string> = {
    Home: '⌂',
    Transactions: '☰',
    Profile: '⚙',
  };

  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>
        {icons[name]}
      </Text>
    </View>
  );
};

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
    paddingBottom: 8,
    height: 60,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
    color: '#999',
  },
  iconFocused: {
    color: '#4F46E5',
  },
});

export default MainTabNavigator;
