import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const AgentClaimsList = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchClaims = async () => {
       try {
    const token = await AsyncStorage.getItem('token');
    console.log('🧪 Token from AsyncStorage:', token);
    if (!token) {
      console.warn('No token found in storage');
      return;
    }

    const res = await axios.get('https://claimit-backend-q4jj.onrender.com/api/claims/agent', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
        setClaims(res.data.claims);
      } catch (err) {
        console.error('Error loading claims:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0F172A" style={{ marginTop: 20 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {claims.map(claim => (
        <TouchableOpacity
          key={claim._id}
          style={styles.card}
          onPress={() => navigation.navigate('ClaimDetails', { claimId: claim._id })}
        >
          <Text style={styles.title}>Driver: {claim.driverName || 'Unknown'}</Text>
          <Text style={styles.subtext}>Location: {claim.location}</Text>
          <Text style={styles.subtext}>Status: {claim.status}</Text>
          <Text style={styles.subtext}>Date: {new Date(claim.submittedAt).toLocaleDateString()}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default AgentClaimsList;

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  subtext: { fontSize: 14, color: '#475569' },
});
