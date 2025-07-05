// screens/admin/AdminAgentsScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminAgentsScreen = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get('https://claimit-backend-q4jj.onrender.com/api/claims/admin/agents', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAgents(res.data.agents);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const groupAgentsByCompany = () => {
    const grouped = {};
    agents.forEach(agent => {
      if (!grouped[agent.insuranceCompany]) grouped[agent.insuranceCompany] = [];
      grouped[agent.insuranceCompany].push(agent);
    });
    return grouped;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1D4ED8" />
      </View>
    );
  }

  const grouped = groupAgentsByCompany();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>👥 Agents Grouped by Insurance</Text>
      {Object.entries(grouped).map(([company, agents]) => (
        <View key={company} style={styles.card}>
          <Text style={styles.company}>{company}</Text>
          {agents.map(agent => (
            <Text key={agent._id} style={styles.agent}>
              {agent.name} ({agent.email})
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
  },
  company: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 8,
  },
  agent: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 4,
  },
});

export default AdminAgentsScreen;
