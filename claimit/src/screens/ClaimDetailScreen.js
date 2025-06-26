// screens/driver/ClaimDetailScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import axios from '../services/api';
import MapView, { Marker } from 'react-native-maps';

const ClaimDetailScreen = ({ route }) => {
  const { claimId } = route.params;
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaimDetail = async () => {
      try {
        const res = await axios.get(`/api/claims/${claimId}`);
        setClaim(res.data);
      } catch (error) {
        console.error('Error fetching claim detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaimDetail();
  }, [claimId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  if (!claim) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Claim not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.title}>Claim Detail</Text>

      <Text style={styles.label}>📅 Date Submitted</Text>
      <Text style={styles.value}>{new Date(claim.date).toLocaleString()}</Text>

      <Text style={styles.label}>📍 Location</Text>
      {claim.location?.latitude && (
        <MapView
          style={styles.map}
          region={{
            latitude: claim.location.latitude,
            longitude: claim.location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: claim.location.latitude,
              longitude: claim.location.longitude,
            }}
            title="Accident Location"
          />
        </MapView>
      )}

      <Text style={styles.label}>📝 Description</Text>
      <Text style={styles.value}>{claim.description || 'No description provided.'}</Text>

      <Text style={styles.label}>🖼️ Photos</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {claim.photos?.map((uri, index) => (
          <Image key={index} source={{ uri }} style={styles.photo} />
        ))}
      </ScrollView>

      <Text style={styles.label}>📌 Status</Text>
      <Text style={[styles.value, getStatusStyle(claim.status)]}>{claim.status}</Text>

      {claim.statusHistory && (
        <>
          <Text style={styles.label}>📊 Status History</Text>
          {claim.statusHistory.map((entry, idx) => (
            <Text key={idx} style={styles.value}>
              {entry.status} - {new Date(entry.timestamp).toLocaleString()}
            </Text>
          ))}
        </>
      )}

      <Text style={styles.label}>Insurance Agent:</Text>
<Text style={styles.value}>
  {claim.driverId.insuranceAgent
    ? `${claim.driverId.insuranceAgent.name} (${claim.driverId.insuranceAgent.email})`
    : 'Not Assigned'}
</Text>

    </ScrollView>
  );
};

const getStatusStyle = (status) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return { color: '#10B981' };
    case 'pending':
      return { color: '#FBBF24' };
    case 'rejected':
      return { color: '#EF4444' };
    default:
      return { color: '#475569' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: '#475569',
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  photo: {
    width: 160,
    height: 160,
    borderRadius: 10,
    marginRight: 10,
    marginTop: 10,
  },
});

export default ClaimDetailScreen;
