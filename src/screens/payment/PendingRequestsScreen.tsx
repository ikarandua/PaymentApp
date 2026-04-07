import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useWalletStore } from '../../stores/walletStore';
import { respondToRequest } from '../../services/paymentService';
import { formatCurrency, formatTransactionTime } from '../../utils/formatters';
import type { PaymentRequest } from '../../types';

interface Props {
  navigation: any;
}

export const PendingRequestsScreen: React.FC<Props> = ({ navigation }) => {
  const { pendingRequests, updateRequest, balance } = useWalletStore();
  const [loading, setLoading] = useState<string | null>(null);

  const handleRespond = async (request: PaymentRequest, accept: boolean) => {
    if (accept && request.amount > balance) {
      Alert.alert('Error', 'Insufficient balance to accept this request');
      return;
    }

    setLoading(request.id);
    try {
      await respondToRequest(request.id, request, accept);
      updateRequest(request.id, accept ? 'accepted' : 'rejected');
      Alert.alert(
        'Success',
        accept
          ? `You paid ${formatCurrency(request.amount)} to ${request.fromName}`
          : 'Request rejected',
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process request');
    } finally {
      setLoading(null);
    }
  };

  const renderRequest = ({ item }: { item: PaymentRequest }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.fromName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.requestInfo}>
          <Text style={styles.requestName}>{item.fromName}</Text>
          <Text style={styles.requestPhone}>{item.fromPhone}</Text>
          <Text style={styles.requestTime}>
            {formatTransactionTime(item.createdAt)}
          </Text>
        </View>
        <Text style={styles.requestAmount}>{formatCurrency(item.amount)}</Text>
      </View>

      {item.note && <Text style={styles.requestNote}>"{item.note}"</Text>}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.rejectButton,
            loading === item.id && styles.buttonDisabled,
          ]}
          onPress={() => handleRespond(item, false)}
          disabled={loading === item.id}
        >
          {loading === item.id ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Text style={styles.rejectText}>Reject</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.acceptButton,
            loading === item.id && styles.buttonDisabled,
          ]}
          onPress={() => handleRespond(item, true)}
          disabled={loading === item.id}
        >
          {loading === item.id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.acceptText}>Pay</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pending Requests</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={pendingRequests}
        keyExtractor={item => item.id}
        renderItem={renderRequest}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No pending requests</Text>
            <Text style={styles.emptySubtext}>
              Requests from others will appear here
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
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  requestPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  requestTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  requestAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  requestNote: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 12,
    paddingLeft: 60,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    paddingLeft: 60,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
    marginRight: 8,
  },
  rejectText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 14,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
    marginLeft: 8,
  },
  acceptText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});

export default PendingRequestsScreen;
