import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';

const ClaimsScreen = () => {
  const navigation = useNavigation();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClaims = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get('https://claimit-backend-q4jj.onrender.com/api/claims/mine', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClaims(res.data.claims || []);
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchClaims();
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const getLocationName = (location) => {
    if (location && location.latitude && location.longitude) {
      return `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`;
    }
    return 'Unknown Location';
  };

  const formatClaimDate = (dateString) => {
    try {
      if (!dateString) return 'No date';
      
      let date = new Date(dateString);
      
      // If date is invalid, try parsing as timestamp
      if (isNaN(date.getTime())) {
        const timestamp = Number(dateString);
        if (!isNaN(timestamp)) {
          date = new Date(timestamp);
        }
      }
      
      // If still invalid, return placeholder
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return format(date, 'd MMM · HH:mm');
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'Date error';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('ClaimDetail', { claimId: item._id })}
      style={styles.cardContainer}
    >
      <View style={[styles.statusIndicator, getStatusStyle(item.status)]} />
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="place" size={20} color="#4B5563" />
          <Text style={styles.location} numberOfLines={1}>
            {getLocationName(item.location)}
          </Text>
          <Text style={styles.date}>
            {formatClaimDate(item.date)}
          </Text>
        </View>
        
        <View style={styles.cardBody}>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, getStatusStyle(item.status)]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.detailsRow}>
            <Icon name="description" size={16} color="#6B7280" />
            <Text style={styles.detailsText} numberOfLines={1}>
              {item.description || 'No description'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return { backgroundColor: '#D1FAE5', color: '#065F46' };
      case 'pending':
        return { backgroundColor: '#FEF3C7', color: '#92400E' };
      case 'rejected':
        return { backgroundColor: '#FEE2E2', color: '#991B1B' };
      default:
        return { backgroundColor: '#E5E7EB', color: '#4B5563' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Claims</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
      ) : claims.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="assignment" size={60} color="#E5E7EB" />
          <Text style={styles.emptyTitle}>No claims yet</Text>
          <Text style={styles.emptyText}>When you submit claims, they'll appear here</Text>
        </View>
      ) : (
        <FlatList
          data={claims}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  cardContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statusIndicator: {
    width: 6,
    backgroundColor: '#3B82F6',
  },
  card: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardBody: {
    marginLeft: 28,
  },
  statusContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  loader: {
    marginTop: 40,
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
    color: '#111827',
    marginBottom: 8,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default ClaimsScreen;