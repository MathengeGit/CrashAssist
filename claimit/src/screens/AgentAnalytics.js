import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AgentAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get('https://claimit-backend-q4jj.onrender.com/api/analytics/summary', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#0F172A" />;
  }

  if (!data) {
  return <Text style={{ padding: 20 }}>Unable to load analytics. Please try again.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📊 Analytics Summary</Text>
      <Text style={styles.stat}>Total Claims: {data.totalClaims}</Text>

      <Text style={styles.subHeader}>Status Breakdown:</Text>
      {data.statusCounts.map((item) => (
        <Text key={item._id} style={styles.stat}>
          {item._id}: {item.count}
        </Text>
      ))}

      <Text style={styles.subHeader}>Recent Claims (last 7 days):</Text>
      {data.claimsByDate.map((day, idx) => {
        const { year, month, day: d } = day._id;
        return (
          <Text key={idx} style={styles.stat}>
            {`${year}-${month}-${d}`}: {day.count}
          </Text>
        );
      })}
    </View>
  );
};

export default AgentAnalytics;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8FAFC' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#0F172A' },
  subHeader: { fontSize: 18, marginTop: 16, color: '#1E293B' },
  stat: { fontSize: 16, marginVertical: 4, color: '#334155' },
});
