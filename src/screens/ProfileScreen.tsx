import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import { formatCurrency, formatPhoneNumber } from '../utils/formatters';
import { getFcmToken } from '../services/notificationService';
import { updateUserFcmToken } from '../services/paymentService';

interface Props {
  navigation: any;
}

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout, enablePin, disablePin, isPinEnabled } = useAuthStore();
  const { theme, setTheme, isDarkMode } = useSettingsStore();
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handlePinToggle = async (value: boolean) => {
    if (value) {
      setShowPinSetup(true);
    } else {
      await disablePin();
    }
  };

  const handlePinSetup = async () => {
    if (newPin.length !== 4) {
      Alert.alert('Error', 'PIN must be 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }

    await enablePin();
    setShowPinSetup(false);
    setNewPin('');
    setConfirmPin('');
    Alert.alert('Success', 'Transaction PIN enabled');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
          });
        },
      },
    ]);
  };

  const handleRefreshToken = async () => {
    try {
      const token = await getFcmToken();
      if (token && user?.uid) {
        await updateUserFcmToken(user.uid, token);
        Alert.alert('Success', 'Push notification token refreshed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh token');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userPhone}>
          {formatPhoneNumber(user?.phone || '')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Balance</Text>
            <Text style={styles.rowValue}>
              {formatCurrency(user?.balance || 0)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Phone</Text>
            <Text style={styles.rowValue}>
              {formatPhoneNumber(user?.phone || '')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.rowLabel}>Transaction PIN</Text>
              <Text style={styles.rowSubtext}>Secure your transactions</Text>
            </View>
            <Switch
              value={isPinEnabled}
              onValueChange={handlePinToggle}
              trackColor={{ false: '#e0e0e0', true: '#a5b4fc' }}
              thumbColor={isPinEnabled ? '#4F46E5' : '#fff'}
            />
          </View>
        </View>
      </View>

      {showPinSetup && (
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.pinTitle}>Set Transaction PIN</Text>
            <TextInput
              style={styles.pinInput}
              placeholder="Enter 4-digit PIN"
              placeholderTextColor="#999"
              value={newPin}
              onChangeText={setNewPin}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
            <TextInput
              style={styles.pinInput}
              placeholder="Confirm PIN"
              placeholderTextColor="#999"
              value={confirmPin}
              onChangeText={setConfirmPin}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
            <View style={styles.pinButtons}>
              <TouchableOpacity
                style={styles.pinCancelButton}
                onPress={() => {
                  setShowPinSetup(false);
                  setNewPin('');
                  setConfirmPin('');
                }}
              >
                <Text style={styles.pinCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pinConfirmButton}
                onPress={handlePinSetup}
              >
                <Text style={styles.pinConfirmText}>Set PIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.card}>
          <View style={styles.themeRow}>
            <Text style={styles.rowLabel}>Dark Mode</Text>
            <View style={styles.themeButtons}>
              {(['system', 'light', 'dark'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.themeButton,
                    theme === t && styles.themeButtonActive,
                  ]}
                  onPress={() => setTheme(t)}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      theme === t && styles.themeButtonTextActive,
                    ]}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleRefreshToken}>
            <Text style={styles.rowLabel}>Refresh Push Token</Text>
            <Text style={styles.rowArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>PaymentApp v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileCard: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowLabel: {
    fontSize: 16,
    color: '#333',
  },
  rowValue: {
    fontSize: 16,
    color: '#666',
  },
  rowSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  rowArrow: {
    fontSize: 18,
    color: '#999',
  },
  pinTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  pinButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pinCancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  pinCancelText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  pinConfirmButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  pinConfirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  themeRow: {
    padding: 16,
  },
  themeButtons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  themeButtonActive: {
    backgroundColor: '#4F46E5',
  },
  themeButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  themeButtonTextActive: {
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default ProfileScreen;
