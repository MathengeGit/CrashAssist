import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../services/api';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DriverHome = () => {
  const [driver, setDriver] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [claimStats, setClaimStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        const profileRes = await axios.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const claimsRes = await axios.get('/claims/mine', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setDriver(profileRes.data.user);

        const claimList = claimsRes.data.claims || [];
        setClaims(claimList);

        // Calculate claim stats
        const stats = {
          total: claimList.length,
          approved: claimList.filter(c => c.status.toLowerCase() === 'approved').length,
          pending: claimList.filter(c => c.status.toLowerCase() === 'pending').length,
          rejected: claimList.filter(c => c.status.toLowerCase() === 'rejected').length,
        };
        setClaimStats(stats);
      } catch (err) {
        console.error('❌ Failed to fetch data:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getLatestClaimStatus = () => {
    if (!claims.length) return null;
    const latest = claims.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
    return latest.status;
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  const latestStatus = getLatestClaimStatus();

  return (
    <ScrollView style={styles.container}>
      {/* Notification Banner */}
      {latestStatus && (
        <View style={[styles.notificationBanner, {
          backgroundColor:
            latestStatus === 'Approved' ? '#4ADE80' :
            latestStatus === 'Rejected' ? '#F87171' : '#FBBF24',
        }]}>
          <Icon name="notifications" size={20} color="#0F172A" />
          <Text style={styles.notificationText}>
            Your latest claim is <Text style={{ fontWeight: 'bold' }}>{latestStatus}</Text>
          </Text>
        </View>
      )}

      {/* Welcome Header */}
      <View style={styles.headerCard}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.driverName}>{driver?.name || 'Driver'}</Text>
        <Text style={styles.subText}>Your dashboard is ready 🚗</Text>
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>📊 Claim Summary</Text>
        <View style={styles.summaryRow}>
          <SummaryItem label="Submitted" value={claimStats.total} color="#0F172A" />
          <SummaryItem label="Approved" value={claimStats.approved} color="#10B981" />
          <SummaryItem label="Pending" value={claimStats.pending} color="#FBBF24" />
          <SummaryItem label="Rejected" value={claimStats.rejected} color="#EF4444" />
        </View>
      </View>

      {/* Dashboard Options */}
      <View style={styles.cardGrid}>
        <DashboardCard
          icon="report"
          label="Report Accident"
          onPress={() => navigation.navigate('ReportIncident1')}
          bgColor="#F87171"
        />
        <DashboardCard
          icon="description"
          label="My Claims"
          onPress={() => navigation.navigate('ClaimsScreen')}
          bgColor="#60A5FA"
        />
        <DashboardCard
          icon="person"
          label="Profile"
          onPress={() => navigation.navigate('ProfileScreen')}
          bgColor="#34D399"
        />
        <DashboardCard
          icon="logout"
          label="Logout"
          onPress={async () => {
            await AsyncStorage.removeItem('token');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }}
          bgColor="#F59E0B"
        />
      </View>
    </ScrollView>
  );
};

const DashboardCard = ({ icon, label, onPress, bgColor }) => (
  <TouchableOpacity style={[styles.card, { backgroundColor: bgColor }]} onPress={onPress}>
    <Icon name={icon} size={34} color="#FFF" />
    <Text style={styles.cardLabel}>{label}</Text>
  </TouchableOpacity>
);

const SummaryItem = ({ label, value, color }) => (
  <View style={styles.summaryItem}>
    <Text style={[styles.summaryValue, { color }]}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </View>
);

export default DriverHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  notificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  notificationText: {
    marginLeft: 10,
    color: '#1E293B',
    fontSize: 14,
  },
  headerCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    elevation: 4,
  },
  welcomeText: {
    color: '#CBD5E1',
    fontSize: 18,
    marginBottom: 6,
  },
  driverName: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '700',
  },
  subText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 4,
  },
  summaryBox: {
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1E293B',
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
    color: '#64748B',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    elevation: 3,
  },
  cardLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
