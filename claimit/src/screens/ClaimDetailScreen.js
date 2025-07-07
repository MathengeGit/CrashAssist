import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';

const ClaimDetailScreen = ({ route, navigation }) => {
  const { claimId } = route.params;
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaimDetail = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get(
          `https://claimit-backend-q4jj.onrender.com/api/claims/view/${claimId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setClaim(res.data);
      } catch (error) {
        console.error('Error fetching claim detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaimDetail();
  }, [claimId]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'd MMM yyyy · h:mm a');
    } catch {
      return 'Date unavailable';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!claim) {
    return (
      <View style={styles.emptyState}>
        <Icon name="error-outline" size={48} color="#EF4444" />
        <Text style={styles.emptyTitle}>Claim not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Claim Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Status Card */}
      <View style={[styles.statusCard, getStatusStyle(claim.status)]}>
        <View style={styles.statusHeader}>
          <Icon name="assignment" size={24} color="#FFFFFF" />
          <Text style={styles.statusTitle}>CLAIM STATUS</Text>
        </View>
        <Text style={styles.statusValue}>{claim.status.toUpperCase()}</Text>
      </View>

      {/* Location Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location Details</Text>
        {claim.location?.latitude ? (
          <>
            <MapView
              style={styles.map}
              region={{
                latitude: claim.location.latitude,
                longitude: claim.location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: claim.location.latitude,
                  longitude: claim.location.longitude,
                }}
                pinColor="#3B82F6"
              />
            </MapView>
            <View style={styles.locationDetails}>
              <Icon name="place" size={20} color="#3B82F6" />
              <Text style={styles.locationText}>
                {claim.address || 'Location coordinates: ' + 
                  `${claim.location.latitude.toFixed(4)}, ${claim.location.longitude.toFixed(4)}`}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.noLocation}>No location data available</Text>
        )}
      </View>

      {/* Timeline Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Claim Timeline</Text>
        <View style={styles.timelineItem}>
          <View style={styles.timelineDot} />
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Claim Submitted</Text>
            <Text style={styles.timelineDate}>{formatDate(claim.date)}</Text>
          </View>
        </View>

        {claim.statusHistory?.map((entry, idx) => (
          <View key={idx} style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>
                Status changed to {entry.status}
              </Text>
              <Text style={styles.timelineDate}>
                {formatDate(entry.timestamp)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Photos Section */}
      {claim.photos?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evidence Photos</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photosContainer}
          >
            {claim.photos.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.photo} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Description Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Incident Description</Text>
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>
            {claim.description || 'No description provided.'}
          </Text>
        </View>
      </View>

      {/* Agent Section */}
      {claim.assignedAgent && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned Agent</Text>
          <View style={styles.agentCard}>
            <View style={styles.agentAvatar}>
              <Icon name="person" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{claim.assignedAgent.name}</Text>
              <Text style={styles.agentEmail}>{claim.assignedAgent.email}</Text>
            </View>
            <TouchableOpacity style={styles.contactButton}>
              <Icon name="chat" size={20} color="#3B82F6" />
              <Text style={styles.contactButtonText}>Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const getStatusStyle = (status) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return { backgroundColor: '#065F46' };
    case 'pending':
      return { backgroundColor: '#92400E' };
    case 'rejected':
      return { backgroundColor: '#991B1B' };
    default:
      return { backgroundColor: '#4B5563' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F9FAFB',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  statusCard: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 1,
  },
  statusValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  map: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  locationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  noLocation: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    marginRight: 12,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  timelineDate: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  photosContainer: {
    paddingBottom: 4,
  },
  photo: {
    width: 160,
    height: 160,
    borderRadius: 8,
    marginRight: 12,
  },
  descriptionCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  agentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  agentEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  contactButtonText: {
    marginLeft: 6,
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ClaimDetailScreen;