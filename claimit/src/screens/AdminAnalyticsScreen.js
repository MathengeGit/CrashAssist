// screens/admin/AdminAnalyticsScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminAnalyticsScreen = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get('https://claimit-backend-q4jj.onrender.com/api/claims/summary', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSummary(res.data);
      } catch (error) {
        console.error('Analytics fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>No data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Admin Analytics</Text>

      <Text style={styles.metric}>Total Claims: <Text style={styles.highlight}>{summary.totalClaims}</Text></Text>

      <Text style={styles.metric}>Status Breakdown:</Text>
      {summary.statusCounts.map((status, idx) => (
        <Text key={idx} style={styles.statusLine}>
          {status._id}: <Text style={styles.highlight}>{status.count}</Text>
        </Text>
      ))}

      <Text style={styles.metric}>Recent Claims Per Day:</Text>
      {summary.claimsByDate.map((entry, idx) => {
        const { year, month, day } = entry._id;
        return (
          <Text key={idx} style={styles.statusLine}>
            {`${year}-${month}-${day}`}: <Text style={styles.highlight}>{entry.count}</Text>
          </Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
  },
  metric: {
    fontSize: 18,
    color: '#1E293B',
    marginTop: 12,
    fontWeight: '600',
  },
  statusLine: {
    fontSize: 16,
    color: '#475569',
    marginLeft: 10,
    marginVertical: 2,
  },
  highlight: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
  },
});

export default AdminAnalyticsScreen;
