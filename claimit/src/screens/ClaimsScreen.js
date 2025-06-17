import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import axios from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ClaimsScreen = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get('/api/claims/mine', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClaims(res.data.claims || []);
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Icon name="place" size={22} color="#3B82F6" />
        <Text style={styles.location}>{item.location || 'No location set'}</Text>
      </View>
      <View style={styles.row}>
        <Icon name="calendar-today" size={20} color="#475569" />
        <Text style={styles.text}>{new Date(item.date).toDateString()}</Text>
      </View>
      <View style={styles.row}>
        <Icon name="assignment" size={20} color="#475569" />
        <Text style={[styles.status, getStatusStyle(item.status)]}>
          {item.status}
        </Text>
      </View>
    </View>
  );

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return { color: '#10B981' };
      case 'pending':
        return { color: '#FBBF24' };
      case 'rejected':
        return { color: '#EF4444' };
      default:
        return { color: '#64748B' };
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Past Claims</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0F172A" style={{ marginTop: 40 }} />
      ) : claims.length === 0 ? (
        <Text style={styles.empty}>No claims submitted yet.</Text>
      ) : (
        <FlatList
          data={claims}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default ClaimsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  location: {
    marginLeft: 10,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  text: {
    marginLeft: 10,
    fontSize: 15,
    color: '#475569',
  },
  status: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  empty: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 40,
  },
});
