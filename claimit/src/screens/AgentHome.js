// screens/AgentHome.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Pressable,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const AgentDashboard = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get('https://metal-seals-like.loca.lt/api/claims/agent', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClaims(res.data.claims);
      } catch (err) {
        console.error('❌ Error fetching claims:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (err) {
      console.error('❌ Logout failed:', err);
    }
  };

  const renderClaim = ({ item }) => (
    <TouchableOpacity
      style={styles.claimCard}
      onPress={() => navigation.navigate('AgentClaimDetails', { claimId: item._id })}
    >
      <View style={styles.claimCardHeader}>
        <Text style={styles.claimTitle}>{item.driverName || 'Unnamed Driver'}</Text>
        <Text style={[styles.claimStatus, getStatusStyle(item.status)]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.claimDate}>
        Submitted: {new Date(item.submittedAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return { color: '#10B981' };
      case 'rejected':
        return { color: '#EF4444' };
      case 'pending':
      default:
        return { color: '#F59E0B' };
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {menuVisible && <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)} />}

      <View style={[styles.mainWrapper, menuVisible && { opacity: 0.5 }]}>
        <View style={styles.mainContainer}>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setMenuVisible(!menuVisible)}
          >
            <Icon name={menuVisible ? 'close' : 'menu'} size={28} color="#1E293B" />
          </TouchableOpacity>

          <ScrollView>
            <View style={styles.headerCard}>
              <Text style={styles.headerText}>Insurance Agent Dashboard</Text>
              <Text style={styles.subText}>Monitor, assess, and resolve claim cases</Text>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0F172A" />
              </View>
            ) : claims.length > 0 ? (
              <FlatList
                data={claims}
                keyExtractor={(item) => item._id}
                renderItem={renderClaim}
                contentContainerStyle={styles.claimList}
              />
            ) : (
              <View style={styles.emptyStateContainer}>
                <Icon name="inbox" size={60} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No Claims Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Claims submitted by drivers will appear here for review.
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.bottomPanel}>
            <TouchableOpacity style={styles.bottomButton} onPress={() => navigation.navigate('AgentMessages')}>
              <Icon name="notifications" size={22} color="#1E293B" />
              <Text style={styles.bottomLabel}>Messages</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomButton} onPress={() => navigation.navigate('AgentAnalytics')}>
              <Icon name="assessment" size={22} color="#1E293B" />
              <Text style={styles.bottomLabel}>Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomButton} onPress={() => navigation.navigate('AgentSettings')}>
              <Icon name="settings" size={22} color="#1E293B" />
              <Text style={styles.bottomLabel}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {menuVisible && (
        <View style={styles.sidebar}>
          <TouchableOpacity style={styles.menuClose} onPress={() => setMenuVisible(false)}>
            <Icon name="close" size={26} color="#CBD5E1" />
          </TouchableOpacity>
          <Text style={styles.sidebarHeader}>Agent Menu</Text>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('AgentHome')}>
            <Icon name="dashboard" size={20} color="#94A3B8" />
            <Text style={styles.navText}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => {
  setMenuVisible(false);
  navigation.navigate('AgentReports');
}}>
  <Icon name="assignment" size={20} color="#94A3B8" />
  <Text style={styles.navText}>Reports</Text>
</TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
            <Icon name="logout" size={20} color="#94A3B8" />
            <Text style={styles.navText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default AgentDashboard;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  overlay: {
    position: 'absolute',
    width: width,
    height: height,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 1,
  },
  mainWrapper: {
    flex: 1,
    zIndex: 0,
  },
  sidebar: {
    width: '60%',
    backgroundColor: '#0F172A',
    paddingVertical: 20,
    paddingHorizontal: 10,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 2,
  },
  menuClose: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  sidebarHeader: {
    color: '#E2E8F0',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 30,
    textAlign: 'center',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  navText: {
    marginLeft: 10,
    color: '#CBD5E1',
    fontSize: 16,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    position: 'relative',
  },
  toggleButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  headerCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
  },
  headerText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
  },
  subText: {
    color: '#CBD5E1',
    marginTop: 6,
    fontSize: 14,
  },
  claimList: {
    paddingBottom: 80,
  },
  claimCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  claimCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  claimTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  claimStatus: {
    fontSize: 14,
    fontWeight: '700',
  },
  claimDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
  },
  emptyStateContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#334155',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#E2E8F0',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
  },
  bottomButton: {
    alignItems: 'center',
  },
  bottomLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#1E293B',
    fontWeight: '500',
  },
});
