// screens/AgentClaimDetails.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TextInput, TouchableOpacity, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

const AgentClaimDetails = () => {
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState('');
  const [status, setStatus] = useState('pending');
  const navigation = useNavigation();
  const route = useRoute();
  const { claimId } = route.params;

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get(`https://claimit-backend-q4jj.onrender.com/api/claims/view/${claimId}`, {

          headers: { Authorization: `Bearer ${token}` },
        });
        setClaim(res.data);
        setReport(res.data.agentReport || '');
        setStatus(res.data.status);

      } catch (err) {
        console.error('❌ Error fetching claim details:', err);
        Alert.alert('Error', 'Failed to load claim details.');
      } finally {
        setLoading(false);
      }
    };
    fetchClaim();
  }, [claimId]);

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`https://claimit-backend-q4jj.onrender.com/api/claims/${claimId}`, { report, status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('✅ Success', 'Claim updated successfully.');
      navigation.goBack();
    } catch (err) {
      console.error('❌ Error updating claim:', err);
      Alert.alert('Error', 'Failed to update claim.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  if (!claim) {
    return (
      <View style={styles.centered}>
        <Text>Claim not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Claim by: {claim.driverName}</Text>
        <Text style={styles.label}>Location:</Text>
        <Text style={styles.text}>
  {claim.location?.latitude && claim.location?.longitude
    ? `Lat: ${claim.location.latitude}, Lng: ${claim.location.longitude}`
    : 'Location not available'}
</Text>

        <Text style={styles.label}>Description:</Text>
        <Text style={styles.text}>{claim.description}</Text>
        <Text style={styles.label}>Submitted:</Text>
        <Text style={styles.text}>{new Date(claim.date).toLocaleString()}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Agent Report</Text>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="Write your assessment here..."
          value={report}
          onChangeText={setReport}
        />

        <Text style={styles.label}>Status:</Text>
        <View style={styles.statusOptions}>
          {['pending', 'approved', 'rejected'].map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.statusButton, status === s && styles.selectedStatus]}
              onPress={() => setStatus(s)}
            >
              <Text style={status === s ? styles.statusTextSelected : styles.statusText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Icon name="save" size={20} color="#FFF" />
          <Text style={styles.submitText}>Submit Report</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AgentClaimDetails;

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
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#0F172A',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1E293B',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 10,
    color: '#475569',
  },
  text: {
    fontSize: 14,
    color: '#334155',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    marginTop: 10,
    textAlignVertical: 'top',
    backgroundColor: '#FFF',
  },
  statusOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  selectedStatus: {
    backgroundColor: '#0F172A',
  },
  statusText: {
    color: '#1E293B',
    fontWeight: '500',
  },
  statusTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    justifyContent: 'center',
  },
  submitText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '600',
  },
});
