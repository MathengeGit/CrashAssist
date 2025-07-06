import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const DriverMessagesScreen = () => {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const profileRes = await axios.get(
          'https://claimit-backend-q4jj.onrender.com/api/auth/profile',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const driver = profileRes.data.user;

        if (!driver.insuranceAgent) {
          setAgent(null);
          return;
        }

        const agentRes = await axios.get(
          `https://claimit-backend-q4jj.onrender.com/api/users/${driver.insuranceAgent}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setAgent(agentRes.data.user);
      } catch (err) {
        console.error('Error fetching agent:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, []);

  const handleChatPress = () => {
    if (!agent) return;
    navigation.navigate('ChatScreen', {
      driverId: agent._id, // even though it's "driverId", we're reusing the ChatScreen component
      driverName: agent.name,
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  if (!agent) {
    return (
      <View style={styles.center}>
        <Text style={styles.info}>No insurance agent assigned yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Assigned Agent:</Text>
      <TouchableOpacity style={styles.card} onPress={handleChatPress}>
        <Text style={styles.name}>{agent.name}</Text>
        <Text style={styles.email}>{agent.email}</Text>
        <Text style={styles.chatHint}>Tap to start chatting 💬</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DriverMessagesScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    fontSize: 16,
    color: '#64748b',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#334155',
  },
  card: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  email: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
  },
  chatHint: {
    marginTop: 10,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#64748b',
  },
});
