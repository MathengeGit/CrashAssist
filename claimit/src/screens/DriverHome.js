import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../services/api';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const STATUS_COLORS = {
  approved: '#10B981',
  pending: '#FBBF24',
  rejected: '#EF4444',
  default: '#6B7280',
};

const STATUS_BACKGROUNDS = {
  approved: '#D1FAE5',
  pending: '#FEF3C7',
  rejected: '#FECACA',
  default: '#E5E7EB',
};

const DriverHome = () => {
  const [driver, setDriver] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const [claimStats, setClaimStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const [profileRes, claimsRes] = await Promise.all([
        axios.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/claims/mine', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setDriver(profileRes.data.user);
      const claimList = claimsRes.data.claims || [];
      setClaims(claimList);

      const stats = {
        total: claimList.length,
        approved: claimList.filter(c => c.status.toLowerCase() === 'approved').length,
        pending: claimList.filter(c => c.status.toLowerCase() === 'pending').length,
        rejected: claimList.filter(c => c.status.toLowerCase() === 'rejected').length,
      };
      setClaimStats(stats);
    } catch (err) {
      console.error('❌ Failed to fetch data:', err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const getLatestClaimStatus = () => {
    if (!claims.length) return null;
    const latest = [...claims].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
    return latest.status.toLowerCase();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const latestStatus = getLatestClaimStatus();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      >
        {/* Error Message */}
        {error && (
          <View style={styles.errorBanner}>
            <Icon name="error" size={20} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchData}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Top Header */}
        <View style={styles.headerSection}>
          <View>
            <Text style={styles.claimItTitle}>Welcome to ClaimIt</Text>
            <Text style={styles.claimItSubtitle}>
              ClaimIt enables fast accident reporting and streamlined insurance claims.
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.bellIcon}
            onPress={() => navigation.navigate('Notifications')}
            accessibilityLabel="Notifications"
          >
            <Icon name="notifications" size={26} color="#1E40AF" />
          </TouchableOpacity>
        </View>

        {/* Notification Status */}
        {latestStatus ? (
          <View style={[
            styles.notificationBanner,
            { backgroundColor: STATUS_BACKGROUNDS[latestStatus] || STATUS_BACKGROUNDS.default }
          ]}>
            <Icon name="info" size={20} color="#1E293B" />
            <Text style={styles.notificationText}>
              Your latest claim is <Text style={{ fontWeight: 'bold' }}>{latestStatus}</Text>
            </Text>
          </View>
        ) : (
          <View style={[styles.notificationBanner, { backgroundColor: STATUS_BACKGROUNDS.default }]}>
            <Icon name="info" size={20} color="#1E293B" />
            <Text style={styles.notificationText}>You have no claims yet</Text>
          </View>
        )}

        {/* Claim Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>📊 Claim Summary</Text>
          <View style={styles.summaryRow}>
            <SummaryItem label="Submitted" value={claimStats.total} color="#1E3A8A" />
            <SummaryItem label="Approved" value={claimStats.approved} color={STATUS_COLORS.approved} />
            <SummaryItem label="Pending" value={claimStats.pending} color={STATUS_COLORS.pending} />
            <SummaryItem label="Rejected" value={claimStats.rejected} color={STATUS_COLORS.rejected} />
          </View>
        </View>

        {/* Tip of the Day */}
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 Tip of the Day</Text>
          <Text style={styles.tipText}>
            {claims.length > 0 
              ? "Always upload clear and timestamped photos of the accident scene."
              : "After an accident, document the scene immediately with photos from multiple angles."}
          </Text>
        </View>

        {/* Dashboard Options */}
        <View style={styles.cardGrid}>
          <DashboardCard
            icon="add-circle-outline"
            label="Report Accident"
            onPress={() => navigation.navigate('ReportIncident1')}
            bgColor="#3B82F6"
            accessibilityLabel="Report new accident"
          />
          <DashboardCard
            icon="list-alt"
            label="My Claims"
            onPress={() => navigation.navigate('ClaimsScreen')}
            bgColor="#10B981"
            badgeCount={claimStats.total}
            accessibilityLabel="View my claims"
          />
          <DashboardCard
            icon="person-outline"
            label="Profile"
            onPress={() => navigation.navigate('ProfileScreen')}
            bgColor="#6366F1"
            accessibilityLabel="View my profile"
          />
          <DashboardCard
            icon="exit-to-app"
            label="Logout"
            onPress={async () => {
              await AsyncStorage.removeItem('token');
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            }}
            bgColor="#EF4444"
            accessibilityLabel="Logout from account"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const SummaryItem = ({ label, value, color }) => (
  <View style={styles.summaryItem}>
    <Text style={[styles.summaryValue, { color }]}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </View>
);

const DashboardCard = ({ icon, label, onPress, bgColor, badgeCount, accessibilityLabel }) => (
  <TouchableOpacity 
    style={[styles.card, { backgroundColor: bgColor }]} 
    onPress={onPress}
    accessibilityLabel={accessibilityLabel || label}
  >
    <View style={styles.cardIconContainer}>
      <Icon name={icon} size={30} color="#FFFFFF" />
      {badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount}</Text>
        </View>
      )}
    </View>
    <Text style={styles.cardLabel}>{label}</Text>
  </TouchableOpacity>
);

export default DriverHome;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    backgroundColor: '#E0F2FE',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  claimItTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  claimItSubtitle: {
    fontSize: 14,
    color: '#0369A1',
    marginTop: 4,
    width: '85%',
  },
  bellIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  notificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  notificationText: {
    marginLeft: 10,
    color: '#1E293B',
    fontSize: 14,
  },
  summaryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  cardIconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  tipBox: {
    backgroundColor: '#E0E7FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1D4ED8',
  },
  tipText: {
    fontSize: 14,
    color: '#1E293B',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    marginLeft: 10,
    color: '#B91C1C',
    fontSize: 14,
  },
  retryText: {
    color: '#3B82F6',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});