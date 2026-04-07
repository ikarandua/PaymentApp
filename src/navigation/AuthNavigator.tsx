import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import PhoneAuthScreen from '../screens/auth/PhoneAuthScreen';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  PhoneAuth: {
    phone: string;
    isSignup: boolean;
    name?: string;
    password?: string;
  };
};

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
    </Stack.Navigator>
  );
};
