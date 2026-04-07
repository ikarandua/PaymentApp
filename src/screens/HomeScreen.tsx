import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useWalletStore } from '../stores/walletStore';
import {
  subscribeToBalance,
  subscribeToTransactions,
  subscribeToPendingRequests,
} from '../services/paymentService';
import { formatCurrency, formatTransactionTime } from '../utils/formatters';
import type { Transaction } from '../types';

interface Props {
  navigation: any;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuthStore();
  const {
    balance,
    transactions,
    pendingRequests,
    setBalance,
    setTransactions,
    setPendingRequests,
    setLoading,
    isLoading,
  } = useWalletStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubBalance = subscribeToBalance(user.uid, setBalance);
    const unsubTransactions = subscribeToTransactions(
      user.uid,
      setTransactions,
    );
    const unsubRequests = subscribeToPendingRequests(
      user.uid,
      setPendingRequests,
    );

    setLoading(false);

    return () => {
      unsubBalance();
      unsubTransactions();
      unsubRequests();
    };
  }, [user?.uid]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() =>
        navigation.navigate('TransactionDetail', { transaction: item })
      }
    >
      <View style={styles.transactionLeft}>
        <View
          style={[
            styles.transactionIcon,
            item.type === 'sent' ? styles.sentIcon : styles.receivedIcon,
          ]}
        >
          <Text style={styles.transactionIconText}>
            {item.type === 'sent' ? '↑' : '↓'}
          </Text>
        </View>
        <View>
          <Text style={styles.transactionName}>
            {item.type === 'sent' ? item.receiverName : item.senderName}
          </Text>
          <Text style={styles.transactionTime}>
            {formatTransactionTime(item.createdAt)}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          item.type === 'sent' ? styles.sentAmount : styles.receivedAmount,
        ]}
      >
        {item.type === 'sent' ? '-' : '+'}
        {formatCurrency(item.amount)}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Hello, {user?.name || 'User'}!</Text>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balance}>{formatCurrency(balance)}</Text>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('SendMoney')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#EEF2FF' }]}>
            <Text style={styles.actionIconText}>↑</Text>
          </View>
          <Text style={styles.actionText}>Send</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('RequestMoney')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#F0FDF4' }]}>
            <Text style={styles.actionIconText}>↓</Text>
          </View>
          <Text style={styles.actionText}>Request</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AddMoney')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#FFF7ED' }]}>
            <Text style={styles.actionIconText}>+</Text>
          </View>
          <Text style={styles.actionText}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('QRScanner')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#FEF2F2' }]}>
            <Text style={styles.actionIconText}>◻</Text>
          </View>
          <Text style={styles.actionText}>Scan</Text>
        </TouchableOpacity>
      </View>

      {pendingRequests.length > 0 && (
        <View style={styles.requestsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Requests</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('PendingRequests')}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={pendingRequests}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.requestCard}
                onPress={() => navigation.navigate('PendingRequests')}
              >
                <Text style={styles.requestName}>{item.fromName}</Text>
                <Text style={styles.requestAmount}>
                  {formatCurrency(item.amount)}
                </Text>
                <Text style={styles.requestNote} numberOfLines={1}>
                  {item.note || 'Payment request'}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions.slice(0, 10)}
        keyExtractor={item => item.id}
        renderItem={renderTransaction}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>Send money to get started</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  listContent: {
    paddingBottom: 20,
  },
  welcomeSection: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  balance: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginHorizontal: 16,
    marginTop: -20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIconText: {
    fontSize: 20,
    color: '#333',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  requestsSection: {
    marginTop: 20,
    paddingLeft: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  requestName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  requestAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginVertical: 4,
  },
  requestNote: {
    fontSize: 12,
    color: '#666',
  },
  recentSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sentIcon: {
    backgroundColor: '#FEE2E2',
  },
  receivedIcon: {
    backgroundColor: '#D1FAE5',
  },
  transactionIconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  transactionTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  sentAmount: {
    color: '#EF4444',
  },
  receivedAmount: {
    color: '#10B981',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});

export default HomeScreen;
