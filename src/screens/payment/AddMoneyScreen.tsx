import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useWalletStore } from '../../stores/walletStore';
import { formatCurrency, validateAmount } from '../../utils/formatters';

interface Props {
  navigation: any;
}

const QUICK_AMOUNTS = [10, 25, 50, 100, 200, 500];

export const AddMoneyScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { balance, setBalance } = useWalletStore();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleAddMoney = async () => {
    if (!validateAmount(amount)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount > 10000) {
      Alert.alert('Error', 'Maximum add amount is $10,000');
      return;
    }

    setLoading(true);
    try {
      await new Promise<void>(resolve => setTimeout(resolve, 1500));
      setBalance(balance + numAmount);

      Alert.alert(
        'Success',
        `${formatCurrency(numAmount)} added to your wallet`,
        [
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add money');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Money</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Enter Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#ccc"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>
        </View>

        <View style={styles.quickAmounts}>
          <Text style={styles.quickLabel}>Quick Add</Text>
          <View style={styles.quickGrid}>
            {QUICK_AMOUNTS.map(value => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.quickButton,
                  amount === value.toString() && styles.quickButtonActive,
                ]}
                onPress={() => handleQuickAmount(value)}
              >
                <Text
                  style={[
                    styles.quickButtonText,
                    amount === value.toString() && styles.quickButtonTextActive,
                  ]}
                >
                  ${value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoTitle}>How it works</Text>
          <Text style={styles.infoText}>
            This is a demo feature. In production, this would connect to a
            payment gateway like Stripe or a bank account.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.addButton,
            (!amount || loading) && styles.buttonDisabled,
          ]}
          onPress={handleAddMoney}
          disabled={!amount || loading}
        >
          <Text style={styles.addButtonText}>
            {loading ? 'Processing...' : 'Add Money'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
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
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 40,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 150,
  },
  quickAmounts: {
    marginBottom: 24,
  },
  quickLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  quickButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    margin: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  quickButtonTextActive: {
    color: '#fff',
  },
  info: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddMoneyScreen;
