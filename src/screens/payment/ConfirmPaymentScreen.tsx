import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useWalletStore } from '../../stores/walletStore';
import { sendMoney } from '../../services/paymentService';
import { formatCurrency } from '../../utils/formatters';
import type { User } from '../../types';

interface Props {
  navigation: any;
  route: {
    params: {
      recipient: User;
      amount: number;
      note?: string;
      type: 'send' | 'request';
    };
  };
}

export const ConfirmPaymentScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { recipient, amount, note, type } = route.params;
  const { user } = useAuthStore();
  const { addTransaction, balance, setBalance } = useWalletStore();
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');

  const handleConfirm = async () => {
    if (user?.pin) {
      setShowPin(true);
      return;
    }
    await processPayment();
  };

  const processPayment = async (enteredPin?: string) => {
    if (user?.pin && enteredPin !== user.pin) {
      Alert.alert('Error', 'Incorrect PIN');
      return;
    }

    setLoading(true);
    try {
      if (type === 'send') {
        const transaction = await sendMoney(
          user!.uid,
          recipient.uid,
          amount,
          note,
        );
        addTransaction(transaction);
        setBalance(balance - amount);

        Alert.alert(
          'Success',
          `You sent ${formatCurrency(amount)} to ${recipient.name}`,
          [
            {
              text: 'Done',
              onPress: () => navigation.navigate('Home'),
            },
          ],
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = () => {
    if (pin.length === 4) {
      setShowPin(false);
      processPayment(pin);
      setPin('');
    }
  };

  if (showPin) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowPin(false)}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Enter PIN</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.pinContainer}>
          <Text style={styles.pinTitle}>Enter your PIN to confirm</Text>
          <View style={styles.pinInputContainer}>
            {[0, 1, 2, 3].map(i => (
              <View
                key={i}
                style={[styles.pinDot, pin.length > i && styles.pinDotFilled]}
              />
            ))}
          </View>
          <View style={styles.pinKeypad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((key, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.pinKey, key === '' && styles.pinKeyEmpty]}
                onPress={() => {
                  if (key === 'del') {
                    setPin(p => p.slice(0, -1));
                  } else if (key !== '' && pin.length < 4) {
                    setPin(p => p + key);
                    if (pin.length === 3) {
                      setTimeout(handlePinSubmit, 100);
                    }
                  }
                }}
                disabled={key === ''}
              >
                <Text style={styles.pinKeyText}>
                  {key === 'del' ? '⌫' : key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Confirm Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            {type === 'send' ? 'Sending to' : 'Requesting from'}
          </Text>
          <View style={styles.recipientRow}>
            <View style={styles.recipientAvatar}>
              <Text style={styles.recipientInitial}>
                {recipient.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.recipientName}>{recipient.name}</Text>
              <Text style={styles.recipientPhone}>{recipient.phone}</Text>
            </View>
          </View>
        </View>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amount}>{formatCurrency(amount)}</Text>
        </View>

        {note && (
          <View style={styles.noteCard}>
            <Text style={styles.noteLabel}>Note</Text>
            <Text style={styles.noteText}>{note}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.confirmButton, loading && styles.buttonDisabled]}
            onPress={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmButtonText}>
                {type === 'send' ? 'Send Money' : 'Request Money'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recipientInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  recipientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  recipientPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  amountCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  amount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
  },
  noteCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  noteLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  confirmButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  pinContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  pinTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 30,
  },
  pinInputContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    marginHorizontal: 10,
  },
  pinDotFilled: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  pinKeypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280,
    justifyContent: 'center',
  },
  pinKey: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  pinKeyEmpty: {
    opacity: 0,
  },
  pinKeyText: {
    fontSize: 28,
    fontWeight: '500',
    color: '#333',
  },
});

export default ConfirmPaymentScreen;
