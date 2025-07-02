import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AgentReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get('https://metal-seals-like.loca.lt/api/claims/agent/reports', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const submittedReports = res.data.claims.filter(claim => claim.agentReport);
        setReports(submittedReports);
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  return (
    <FlatList
      data={reports}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>Driver: {item.driverName}</Text>
          <Text style={styles.text}>Location: {item.location}</Text>
          <Text style={styles.text}>Status: {item.status}</Text>
          <Text style={styles.text}>Report: {item.agentReport}</Text>
          <Text style={styles.date}>
            Submitted: {new Date(item.agentReportDate).toLocaleString()}
          </Text>
        </View>
      )}
    />
  );
};

export default AgentReports;

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  text: { fontSize: 14, color: '#334155', marginTop: 4 },
  date: { fontSize: 12, color: '#64748B', marginTop: 8 },
});
