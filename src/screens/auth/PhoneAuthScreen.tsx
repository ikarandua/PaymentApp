import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import {
  createUserProfile,
  getUserByPhone,
} from '../../services/paymentService';

interface Props {
  navigation: any;
  route: {
    params: {
      phone: string;
      isSignup: boolean;
      name?: string;
      password?: string;
    };
  };
}

export const PhoneAuthScreen: React.FC<Props> = ({ navigation, route }) => {
  const { phone, isSignup, name, password } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { confirmationResult, setUser, setConfirmationResult } = useAuthStore();
  const inputRef = useRef<TextInput>(null);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        const { getAuth } = await import('../../services/firebase');
        const auth = getAuth();
        const { signInWithCredential, PhoneAuthProvider } =
          await import('@react-native-firebase/auth');

        const credential = PhoneAuthProvider.credential(
          confirmationResult.verificationId,
          otp,
        );
        const userCredential = await signInWithCredential(auth, credential);
        const uid = userCredential.user.uid;

        await createUserProfile(uid, phone, name || 'User');

        const { getFirestore } = await import('../../services/firebase');
        const db = getFirestore();
        const { doc, getDoc, setDoc, serverTimestamp } =
          await import('@react-native-firebase/firestore');

        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            uid,
            phone: userData.phone,
            name: userData.name,
            balance: userData.balance,
            createdAt: userData.createdAt?.toDate() || new Date(),
          });
        }

        setConfirmationResult(null);
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        Alert.alert(
          'Success',
          'Phone number verified! You can now login with your password.',
        );
        navigation.navigate('Login');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const { getAuth } = await import('../../services/firebase');
      const auth = getAuth();
      const { signInWithPhoneNumber } =
        await import('@react-native-firebase/auth');

      const confirmation = await signInWithPhoneNumber(auth, phone);
      setConfirmationResult(confirmation);
      Alert.alert('Success', 'OTP resent successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}
          {phone}
        </Text>

        <View style={styles.otpContainer}>
          <TextInput
            ref={inputRef}
            style={styles.otpInput}
            placeholder="------"
            placeholderTextColor="#ccc"
            value={otp}
            onChangeText={text => setOtp(text.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResend} disabled={resending}>
            <Text style={styles.resendLink}>
              {resending ? 'Sending...' : 'Resend'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  otpContainer: {
    width: '100%',
    marginBottom: 30,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: '#4F46E5',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 8,
    color: '#333',
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 80,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: 30,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  resendLink: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
});

export default PhoneAuthScreen;
