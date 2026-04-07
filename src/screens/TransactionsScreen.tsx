import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useWalletStore } from '../stores/walletStore';
import { formatCurrency, formatTransactionTime } from '../utils/formatters';
import type { Transaction } from '../types';

interface Props {
  navigation: any;
}

type FilterType = 'all' | 'sent' | 'received';
type StatusFilter = 'all' | 'completed' | 'pending';

export const TransactionsScreen: React.FC<Props> = ({ navigation }) => {
  const { transactions } = useWalletStore();
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (filterType !== 'all' && tx.type !== filterType) return false;
      if (filterStatus !== 'all' && tx.status !== filterStatus) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const name = tx.type === 'sent' ? tx.receiverName : tx.senderName;
        const phone = tx.type === 'sent' ? tx.receiverPhone : tx.senderPhone;
        if (!name.toLowerCase().includes(query) && !phone.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, filterType, filterStatus, searchQuery]);

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
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionName}>
            {item.type === 'sent' ? item.receiverName : item.senderName}
          </Text>
          <View style={styles.transactionMeta}>
            <Text style={styles.transactionStatus}>
              {item.status === 'completed' ? 'Completed' : 'Pending'}
            </Text>
            <Text style={styles.transactionDot}>·</Text>
            <Text style={styles.transactionTime}>
              {formatTransactionTime(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.transactionAmount,
            item.type === 'sent' ? styles.sentAmount : styles.receivedAmount,
          ]}
        >
          {item.type === 'sent' ? '-' : '+'}
          {formatCurrency(item.amount)}
        </Text>
        {item.note && (
          <Text style={styles.transactionNote} numberOfLines={1}>
            {item.note}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('PendingRequests')}
        >
          <Text style={styles.requestsLink}>Requests</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or phone..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          {(['all', 'sent', 'received'] as FilterType[]).map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterChip,
                filterType === type && styles.filterChipActive,
              ]}
              onPress={() => setFilterType(type)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterType === type && styles.filterChipTextActive,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.filterRow}>
          {(['all', 'completed', 'pending'] as StatusFilter[]).map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                styles.filterChipSmall,
                filterStatus === status && styles.filterChipActive,
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterStatus === status && styles.filterChipTextActive,
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={item => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Send or receive money to see it here'}
            </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  requestsLink: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterChipSmall: {
    paddingHorizontal: 12,
  },
  filterChipActive: {
    backgroundColor: '#4F46E5',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  transactionStatus: {
    fontSize: 12,
    color: '#10B981',
  },
  transactionDot: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 4,
  },
  transactionTime: {
    fontSize: 12,
    color: '#999',
  },
  transactionRight: {
    alignItems: 'flex-end',
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
  transactionNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    maxWidth: 120,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
    textAlign: 'center',
  },
});

export default TransactionsScreen;
