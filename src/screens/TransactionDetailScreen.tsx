import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { formatCurrency, format, formatPhoneNumber } from '../utils/formatters';
import type { Transaction } from '../types';

interface Props {
  navigation: any;
  route: {
    params: {
      transaction: Transaction;
    };
  };
}

export const TransactionDetailScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { transaction } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Transaction Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.amountCard}>
          <View
            style={[
              styles.amountIcon,
              transaction.type === 'sent'
                ? styles.sentIcon
                : styles.receivedIcon,
            ]}
          >
            <Text style={styles.amountIconText}>
              {transaction.type === 'sent' ? '↑' : '↓'}
            </Text>
          </View>
          <Text style={styles.amountLabel}>
            {transaction.type === 'sent' ? 'Sent to' : 'Received from'}
          </Text>
          <Text style={styles.amountName}>
            {transaction.type === 'sent'
              ? transaction.receiverName
              : transaction.senderName}
          </Text>
          <Text
            style={[
              styles.amount,
              transaction.type === 'sent'
                ? styles.sentAmount
                : styles.receivedAmount,
            ]}
          >
            {transaction.type === 'sent' ? '-' : '+'}
            {formatCurrency(transaction.amount)}
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {transaction.status === 'completed' ? 'Completed' : 'Pending'}
            </Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={styles.detailValue}>{transaction.id}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>
              {format(transaction.createdAt, 'MMM DD, YYYY HH:mm')}
            </Text>
          </View>

          {transaction.type === 'sent' ? (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Recipient</Text>
                <Text style={styles.detailValue}>
                  {transaction.receiverName}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>
                  {formatPhoneNumber(transaction.receiverPhone)}
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sender</Text>
                <Text style={styles.detailValue}>{transaction.senderName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>
                  {formatPhoneNumber(transaction.senderPhone)}
                </Text>
              </View>
            </>
          )}

          {transaction.note && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Note</Text>
              <Text style={styles.detailValue}>{transaction.note}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={[styles.detailValue, styles.statusValue]}>
              {transaction.status.charAt(0).toUpperCase() +
                transaction.status.slice(1)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
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
    paddingBottom: 16,
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
    padding: 16,
  },
  amountCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  amountIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  sentIcon: {
    backgroundColor: '#FEE2E2',
  },
  receivedIcon: {
    backgroundColor: '#D1FAE5',
  },
  amountIconText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  amountName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sentAmount: {
    color: '#EF4444',
  },
  receivedAmount: {
    color: '#10B981',
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  statusValue: {
    color: '#10B981',
  },
});

export default TransactionDetailScreen;
