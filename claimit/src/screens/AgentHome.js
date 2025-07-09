import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Pressable,
  Dimensions,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react'

const { width, height } = Dimensions.get('window');

const AgentDashboard = () => {
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();

  useFocusEffect(
  useCallback(() => {
    const fetchClaims = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get('https://claimit-backend-q4jj.onrender.com/api/claims/agent', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClaims(res.data.claims);
        setFilteredClaims(res.data.claims);
      } catch (err) {
        console.error('❌ Error fetching claims:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [])
);

  useEffect(() => {
    filterClaims();
  }, [searchQuery, activeFilter, claims]);

  const filterClaims = () => {
    let result = [...claims];
    
    // Apply status filter
    if (activeFilter !== 'all') {
      result = result.filter(claim => claim.status === activeFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(claim => 
        (claim.driverName?.toLowerCase().includes(query)) ||
        (claim._id?.toLowerCase().includes(query)) ||
        (claim.description?.toLowerCase().includes(query))
      );
    }
    
    setFilteredClaims(result);
  };

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
      <View style={styles.claimHeader}>
        <View style={styles.claimMeta}>
          <Text style={styles.claimId}>#{item._id.slice(-6).toUpperCase()}</Text>
          <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.claimTitle}>{item.driverName || 'Unnamed Driver'}</Text>
        {item.description && (
          <Text style={styles.claimDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
      
      <View style={styles.claimFooter}>
        <View style={styles.dateContainer}>
          <MaterialIcons name="schedule" size={16} color="#64748B" />
          <Text style={styles.claimDate}>
            {new Date(item.submittedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.assignButton}
          onPress={(e) => {
            e.stopPropagation();
            // Handle assignment logic here
          }}
        >
          <Text style={styles.assignButtonText}>Assign</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return { backgroundColor: '#D1FAE5', borderColor: '#059669' };
      case 'rejected':
        return { backgroundColor: '#FEE2E2', borderColor: '#DC2626' };
      case 'pending':
      default:
        return { backgroundColor: '#FEF3C7', borderColor: '#D97706' };
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Sidebar Overlay */}
      {menuVisible && <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)} />}

      {/* Main Content */}
      <View style={[styles.mainWrapper, menuVisible && styles.mainWrapperBlur]}>
        <View style={styles.mainContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuVisible(!menuVisible)}
            >
              <MaterialIcons name={menuVisible ? 'close' : 'menu'} size={24} color="#1E293B" />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Claims Dashboard</Text>
              <Text style={styles.headerSubtitle}>
                {filteredClaims.length} {filteredClaims.length === 1 ? 'claim' : 'claims'}
              </Text>
            </View>
            
            <View style={styles.headerActions}>
              <MaterialIcons name="notifications" size={24} color="#3B82F6" />
            </View>
          </View>

          {/* Search and Filter */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <MaterialIcons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search claims..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialIcons name="close" size={20} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterTabs}>
            <TouchableOpacity
              style={[styles.filterTab, activeFilter === 'all' && styles.activeFilterTab]}
              onPress={() => setActiveFilter('all')}
            >
              <Text style={[styles.filterTabText, activeFilter === 'all' && styles.activeFilterTabText]}>
                All
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterTab, activeFilter === 'pending' && styles.activeFilterTab]}
              onPress={() => setActiveFilter('pending')}
            >
              <Text style={[styles.filterTabText, activeFilter === 'pending' && styles.activeFilterTabText]}>
                Pending
              </Text>
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {claims.filter(c => c.status === 'pending').length}
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterTab, activeFilter === 'approved' && styles.activeFilterTab]}
              onPress={() => setActiveFilter('approved')}
            >
              <Text style={[styles.filterTabText, activeFilter === 'approved' && styles.activeFilterTabText]}>
                Approved
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterTab, activeFilter === 'rejected' && styles.activeFilterTab]}
              onPress={() => setActiveFilter('rejected')}
            >
              <Text style={[styles.filterTabText, activeFilter === 'rejected' && styles.activeFilterTabText]}>
                Rejected
              </Text>
            </TouchableOpacity>
          </View>

          {/* Claims List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Loading claims...</Text>
            </View>
          ) : filteredClaims.length > 0 ? (
            <FlatList
              data={filteredClaims}
              keyExtractor={(item) => item._id}
              renderItem={renderClaim}
              contentContainerStyle={styles.claimsList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="inbox" size={60} color="#E2E8F0" />
              <Text style={styles.emptyTitle}>No claims found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery || activeFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Claims submitted by drivers will appear here'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Sidebar */}
      {menuVisible && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <View style={styles.agentAvatar}>
              <MaterialIcons name="person" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.agentName}>Agent Dashboard</Text>
          </View>
          
          <View style={styles.sidebarMenu}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('AgentHome');
              }}
            >
              <MaterialIcons name="dashboard" size={20} color="#3B82F6" />
              <Text style={styles.menuItemText}>Dashboard</Text>
              <View style={styles.menuItemBadge}>
                <Text style={styles.menuItemBadgeText}>{claims.length}</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('AgentReports');
              }}
            >
              <MaterialIcons name="assessment" size={20} color="#64748B" />
              <Text style={styles.menuItemText}>Reports</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('AgentSettings');
              }}
            >
              <MaterialIcons name="settings" size={20} color="#64748B" />
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={20} color="#EF4444" />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  mainWrapperBlur: {
    opacity: 0.5,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  menuButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    paddingVertical: 0,
  },
  filterTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFilterTab: {
    borderBottomColor: '#3B82F6',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeFilterTabText: {
    color: '#3B82F6',
  },
  filterBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  claimsList: {
    paddingBottom: 24,
  },
  claimCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  claimHeader: {
    marginBottom: 12,
  },
  claimMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  claimId: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  claimTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  claimDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  claimFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  claimDate: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  assignButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  assignButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748B',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  sidebar: {
    width: width * 0.75,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    paddingTop: 40,
  },
  sidebarHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  sidebarMenu: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemText: {
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 12,
    flex: 1,
  },
  menuItemBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  menuItemBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 12,
  },
});

export default AgentDashboard;