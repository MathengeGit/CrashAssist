import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../services/api';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

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
  const colorScheme = useColorScheme();
  const [manualTheme, setManualTheme] = useState(null); // 'dark' or 'light'
  const isDarkMode = manualTheme ? manualTheme === 'dark' : colorScheme === 'dark';

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      // Load saved theme preference
      const savedTheme = await AsyncStorage.getItem('userTheme');
      if (savedTheme) setManualTheme(savedTheme);

      const [profileRes, claimsRes] = await Promise.all([
        axios.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/claims/mine', {
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

  const toggleTheme = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newTheme = isDarkMode ? 'light' : 'dark';
    await AsyncStorage.setItem('userTheme', newTheme);
    setManualTheme(newTheme);
  };

  const getLatestClaimStatus = () => {
    if (!claims.length) return null;
    const latest = [...claims].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
    return latest.status.toLowerCase();
  };

  const handleCardPress = (action) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#0F172A' : '#F3F4F6' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const latestStatus = getLatestClaimStatus();
  const tips = [
    "Upload timestamped photos for faster claims.",
    "Check your claim status regularly.",
    "Contact support if your claim is pending > 7 days.",
  ];

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.darkSafeArea]}>
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
        {error && (
          <View style={[styles.errorBanner, isDarkMode && styles.darkErrorBanner]}>
            <Icon name="error" size={20} color="#DC2626" />
            <Text style={[styles.errorText, isDarkMode && styles.darkErrorText]}>{error}</Text>
            <TouchableOpacity onPress={fetchData}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <LinearGradient
          colors={isDarkMode ? ['#1E293B', '#0F172A'] : ['#3B82F6', '#1D4ED8']}
          style={styles.headerSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.headerTopRow}>
  <Text style={[styles.claimItTitle, isDarkMode && styles.darkText]}>Welcome to ClaimIt</Text>
  <View style={styles.iconRow}>
    <TouchableOpacity 
      style={styles.iconButton}
      onPress={toggleTheme}
      accessibilityLabel="Toggle dark mode"
    >
      <Icon 
        name={isDarkMode ? 'wb-sunny' : 'nights-stay'} 
        size={24} 
        color={isDarkMode ? '#FBBF24' : '#FFFFFF'} 
      />
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.iconButton}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('Notifications');
      }}
      accessibilityLabel="Notifications"
      accessibilityRole="button"
    >
      <Icon name="notifications" size={26} color={isDarkMode ? '#E2E8F0' : '#FFFFFF'} />
      <View style={[styles.notificationBadge, { backgroundColor: isDarkMode ? '#FBBF24' : '#FFFFFF' }]} />
    </TouchableOpacity>
  </View>
</View>

            <Text style={[styles.claimItSubtitle, isDarkMode && styles.darkSubtitle]}>
              Fast accident reporting and streamlined insurance claims.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bellIcon}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('Notifications');
            }}
            accessibilityLabel="Notifications"
            accessibilityRole="button"
          >
            <Icon name="notifications" size={26} color={isDarkMode ? '#E2E8F0' : '#FFFFFF'} />
            <View style={[styles.notificationBadge, { backgroundColor: isDarkMode ? '#FBBF24' : '#FFFFFF' }]} />
          </TouchableOpacity>
        </LinearGradient>

        {latestStatus ? (
          <View style={[
            styles.notificationBanner,
            { backgroundColor: isDarkMode ? '#334155' : STATUS_BACKGROUNDS[latestStatus] }
          ]}>
            <Icon
              name={
                latestStatus === 'approved' ? 'check-circle' :
                latestStatus === 'rejected' ? 'error' : 'schedule'
              }
              size={20}
              color={
                latestStatus === 'approved' ? '#10B981' :
                latestStatus === 'rejected' ? '#EF4444' : '#F59E0B'
              }
            />
            <Text style={[styles.notificationText, isDarkMode && styles.darkText]}>
              Your latest claim is <Text style={{ fontWeight: 'bold' }}>{latestStatus}</Text>
            </Text>
          </View>
        ) : (
          <View style={[styles.notificationBanner, { backgroundColor: isDarkMode ? '#334155' : STATUS_BACKGROUNDS.default }]}>
            <Icon name="info" size={20} color={isDarkMode ? '#94A3B8' : '#1E293B'} />
            <Text style={[styles.notificationText, isDarkMode && styles.darkText]}>You have no claims yet</Text>
          </View>
        )}

        <View style={[styles.summaryBox, isDarkMode && styles.darkCard]}>
          <Text style={[styles.summaryTitle, isDarkMode && styles.darkText]}>📊 Claim Summary</Text>
          <View style={styles.summaryRow}>
            <SummaryItem label="Submitted" value={claimStats.total} color={isDarkMode ? '#E2E8F0' : '#1E3A8A'} />
            <SummaryItem label="Approved" value={claimStats.approved} color={STATUS_COLORS.approved} />
            <SummaryItem label="Pending" value={claimStats.pending} color={STATUS_COLORS.pending} />
            <SummaryItem label="Rejected" value={claimStats.rejected} color={STATUS_COLORS.rejected} />
          </View>
        </View>

        <View style={[styles.tipBox, isDarkMode && styles.darkTipBox]}>
          <Text style={[styles.tipTitle, isDarkMode && styles.darkText]}>💡 Tip of the Day</Text>
          <Text style={[styles.tipText, isDarkMode && styles.darkText]}>
            {claims.length > 0 ? tips[0] : tips[1]}
          </Text>
        </View>

        <View style={styles.cardGrid}>
          <DashboardCard
            icon="add-circle-outline"
            label="Report Accident"
            onPress={() => handleCardPress(() => navigation.navigate('ReportIncident1'))}
            bgColor={isDarkMode ? '#2563EB' : '#3B82F6'}
            accessibilityLabel="Report new accident"
            isDarkMode={isDarkMode}
          />
          <DashboardCard
            icon="list-alt"
            label="My Claims"
            onPress={() => handleCardPress(() => navigation.navigate('Claims'))}
            bgColor={isDarkMode ? '#059669' : '#10B981'}
            badgeCount={claimStats.total}
            accessibilityLabel="View my claims"
            isDarkMode={isDarkMode}
          />
          <DashboardCard
            icon="person-outline"
            label="Profile"
            onPress={() => handleCardPress(() => navigation.navigate('ProfileScreen'))}
            bgColor={isDarkMode ? '#7C3AED' : '#6366F1'}
            accessibilityLabel="View my profile"
            isDarkMode={isDarkMode}
          />
          <DashboardCard
            icon="exit-to-app"
            label="Logout"
            onPress={() => handleCardPress(async () => {
              await AsyncStorage.removeItem('token');
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            })}
            bgColor={isDarkMode ? '#DC2626' : '#EF4444'}
            accessibilityLabel="Logout from account"
            isDarkMode={isDarkMode}
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

const DashboardCard = ({ icon, label, onPress, bgColor, badgeCount, accessibilityLabel, isDarkMode }) => (
  <TouchableOpacity
    style={[
      styles.card, 
      { backgroundColor: bgColor },
      isDarkMode && styles.darkCardShadow
    ]}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityLabel={accessibilityLabel || label}
    accessibilityRole="button"
  >
    <View style={styles.cardIconCircle}>
      <Icon name={icon} size={24} color="#FFF" />
    </View>
    <Text style={styles.cardLabel}>{label}</Text>
    {badgeCount > 0 && (
      <View style={[
        styles.cardBadge,
        { backgroundColor: isDarkMode ? '#F8FAFC' : '#FFFFFF' }
      ]}>
        <Text style={[
          styles.cardBadgeText,
          { color: isDarkMode ? '#1E293B' : '#000000' }
        ]}>
          {badgeCount}
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  darkSafeArea: {
    backgroundColor: '#0F172A',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeToggle: {
    padding: 8,
  },
  claimItTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  darkText: {
    color: '#F8FAFC',
  },
  darkSubtitle: {
    color: 'rgba(248, 250, 252, 0.8)',
  },
  claimItSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    width: '85%',
  },
  
  iconRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  paddingRight: 40,   // soft push from the edge
},

iconButton: {
  padding: 8,
  position: 'relative',
},

  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  notificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
  darkCard: {
    backgroundColor: '#1E293B',
    shadowColor: '#64748B',
  },
  darkCardShadow: {
    shadowColor: '#64748B',
    shadowOpacity: 0.3,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardIconCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBadgeText: {
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
  darkTipBox: {
    backgroundColor: '#334155',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1D4ED8',
  },
  darkTipTitle: {
    color: '#60A5FA',
  },
  tipText: {
    fontSize: 14,
    color: '#1E293B',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  darkErrorBanner: {
    backgroundColor: '#7F1D1D',
  },
  errorText: {
    flex: 1,
    marginLeft: 10,
    color: '#B91C1C',
    fontSize: 14,
  },
  darkErrorText: {
    color: '#FECACA',
  },
  retryText: {
    color: '#3B82F6',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default DriverHome;