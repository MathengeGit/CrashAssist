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
import axios from '../services/api'; // ✅ Your baseURL Axios setup
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DriverHome = () => {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDriver(res.data.user);
      } catch (err) {
        console.error('❌ Failed to fetch driver profile:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcome}>Welcome back,</Text>
      <Text style={styles.name}>{driver?.name || 'Driver'}</Text>

      <View style={styles.cardGrid}>
        <DashboardCard
          icon="report"
          label="Report Accident"
          onPress={() => navigation.navigate('ReportIncident1')} // ✅ This must be registered
          bgColor="#F87171"
        />
        <DashboardCard
          icon="description"
          label="View Claims"
          onPress={() => navigation.navigate('ClaimsScreen')} // ✅ This must be registered
          bgColor="#60A5FA"
        />
        <DashboardCard
          icon="person"
          label="My Profile"
          onPress={() => navigation.navigate('ProfileScreen')} // ✅ This must be registered
          bgColor="#34D399"
        />
      </View>
    </ScrollView>
  );
};

const DashboardCard = ({ icon, label, onPress, bgColor }) => (
  <TouchableOpacity style={[styles.card, { backgroundColor: bgColor }]} onPress={onPress}>
    <Icon name={icon} size={32} color="#FFF" />
    <Text style={styles.cardLabel}>{label}</Text>
  </TouchableOpacity>
);

export default DriverHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 20,
  },
  welcome: {
    fontSize: 20,
    color: '#64748B',
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  cardLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
