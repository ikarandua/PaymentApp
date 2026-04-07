import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useWalletStore } from '../../stores/walletStore';
import { getUserByPhone, sendMoney } from '../../services/paymentService';
import {
  formatCurrency,
  validatePhoneNumber,
  validateAmount,
} from '../../utils/formatters';
import type { User } from '../../types';

interface Props {
  navigation: any;
}

export const SendMoneyScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { balance } = useWalletStore();
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [recipient, setRecipient] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearchUser = async () => {
    if (!validatePhoneNumber(phone)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    if (phone === user?.phone) {
      Alert.alert('Error', 'You cannot send money to yourself');
      return;
    }

    setSearching(true);
    try {
      const formattedPhone = phone.startsWith('+')
        ? phone
        : `+1${phone.replace(/\D/g, '')}`;
      const foundUser = await getUserByPhone(formattedPhone);

      if (!foundUser) {
        Alert.alert('Error', 'User not found with this phone number');
        setRecipient(null);
      } else {
        setRecipient(foundUser);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to find user');
    } finally {
      setSearching(false);
    }
  };

  const handleContinue = () => {
    if (!recipient) {
      Alert.alert('Error', 'Please search for a valid recipient first');
      return;
    }

    if (!validateAmount(amount)) {
      Alert.alert('Error', 'Please enter a valid amount (1 - 10,000)');
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount > balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    navigation.navigate('ConfirmPayment', {
      recipient,
      amount: numAmount,
      note,
      type: 'send',
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Send Money</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.inputSection}>
            <Text style={styles.label}>Recipient's Phone Number</Text>
            <View style={styles.phoneRow}>
              <TextInput
                style={[styles.input, styles.phoneInput]}
                placeholder="Enter phone number"
                placeholderTextColor="#999"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                style={[
                  styles.searchButton,
                  searching && styles.buttonDisabled,
                ]}
                onPress={handleSearchUser}
                disabled={searching}
              >
                {searching ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.searchButtonText}>Search</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {recipient && (
            <View style={styles.recipientCard}>
              <View style={styles.recipientAvatar}>
                <Text style={styles.recipientInitial}>
                  {recipient.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.recipientInfo}>
                <Text style={styles.recipientName}>{recipient.name}</Text>
                <Text style={styles.recipientPhone}>{recipient.phone}</Text>
              </View>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          )}

          <View style={styles.inputSection}>
            <Text style={styles.label}>Amount</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#ccc"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>
            <Text style={styles.balanceText}>
              Available: {formatCurrency(balance)}
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Note (Optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="What's this for?"
              placeholderTextColor="#999"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              (!recipient || !amount) && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!recipient || !amount}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
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
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: 'row',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f9fa',
  },
  phoneInput: {
    flex: 1,
    marginRight: 12,
  },
  searchButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  recipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#86efac',
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
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recipientPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 20,
    color: '#22c55e',
    fontWeight: 'bold',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '600',
    color: '#333',
    paddingVertical: 14,
  },
  balanceText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f9fa',
    height: 100,
    textAlignVertical: 'top',
  },
  continueButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SendMoneyScreen;
