import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Linking,
  Image,
  Pressable,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { format } from 'date-fns';
import Modal from 'react-native-modal';
import MapView, { Marker } from 'react-native-maps';
import { Alert } from 'react-native';




const AgentClaimDetails = () => {
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState('');
  const [status, setStatus] = useState('pending');
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { claimId } = route.params;

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get(
          `https://claimit-backend-q4jj.onrender.com/api/claims/view/${claimId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setClaim(res.data);
        setReport(res.data.agentReport || '');
        setStatus(res.data.status);
      } catch (err) {
        console.error('Error fetching claim details:', err);
        Alert.alert('Error', 'Failed to load claim details.');
      } finally {
        setLoading(false);
      }
    };
    fetchClaim();
  }, [claimId]);

  const validateForm = () => {
  if (!report.trim()) {
    Alert.alert('Validation Error', 'Please write your assessment report');
    return false;
  }

  const validStatuses = ['pending', 'approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    Alert.alert('Validation Error', 'Please select a valid status');
    return false;
  }

  return true;
};


  const handleSubmit = async () => {
  if (!validateForm()) return;

  setIsSubmitting(true);
  try {
    const token = await AsyncStorage.getItem('token');
    await axios.put(
      `https://claimit-backend-q4jj.onrender.com/api/claims/${claimId}`,
      { agentReport: report, status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    Alert.alert('Success', 'Claim updated successfully', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  } catch (err) {
    console.error('Error updating claim:', err);
    Alert.alert('Error', 'Failed to update claim.');
  } finally {
    setIsSubmitting(false);
  }
};


  const openMap = () => {
    if (claim?.location?.latitude && claim?.location?.longitude) {
      const url = `https://www.google.com/maps?q=${claim.location.latitude},${claim.location.longitude}`;
      Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'PPPpp');
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
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Claim not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = claim.photos?.map(photo => ({
  url: photo, // directly use the base64 image string
}));


  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Claim Details</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Claim Info Card */}
        <View style={styles.card}>
          <View style={styles.claimHeader}>
            <View style={styles.claimIdBadge}>
              <Text style={styles.claimIdText}>#{claim._id.slice(-6).toUpperCase()}</Text>
            </View>
            <Text style={styles.driverName}>{claim.driverName || 'Unnamed Driver'}</Text>
          </View>

          <View style={styles.divider} />

          {/* Location Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="place" size={20} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Location</Text>
            </View>
            {claim.location?.latitude && claim.location?.longitude ? (
  <MapView
    style={styles.map}
    initialRegion={{
      latitude: claim.location.latitude,
      longitude: claim.location.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }}
  >
    <Marker
      coordinate={{
        latitude: claim.location.latitude,
        longitude: claim.location.longitude,
      }}
      title="Accident Location"
      description={claim.description}
    />
  </MapView>
) : (
  <Text style={styles.noLocationText}>Location not available</Text>
)}

          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="description" size={20} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <Text style={styles.descriptionText}>
              {claim.description || 'No description provided'}
            </Text>
          </View>

          {/* Timeline Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="schedule" size={20} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Timeline</Text>
            </View>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Claim Submitted</Text>
                <Text style={styles.timelineDate}>{formatDate(claim.date)}</Text>
              </View>
            </View>
          </View>

          {/* Photos Section */}
          {images?.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="photo-library" size={20} color="#3B82F6" />
                <Text style={styles.sectionTitle}>Evidence Photos ({images.length})</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photosContainer}
              >
                {images.map((img, index) => (
                  <Pressable
                    key={index}
                    onPress={() => {
                      setSelectedImageIndex(index);
                      setImageModalVisible(true);
                    }}
                  >
                    <Image source={{ uri: img.url }} style={styles.photo} />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Agent Report Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Icon name="assignment" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Agent Report</Text>
          </View>
          
          <TextInput
            style={styles.reportInput}
            multiline
            placeholder="Write your detailed assessment here..."
            placeholderTextColor="#94A3B8"
            value={report}
            onChangeText={setReport}
            textAlignVertical="top"
          />

          <Text style={styles.statusLabel}>Update Claim Status</Text>
          <View style={styles.statusOptions}>
            {[
              { value: 'pending', label: 'Pending', color: '#F59E0B' },
              { value: 'approved', label: 'Approve', color: '#10B981' },
              { value: 'rejected', label: 'Reject', color: '#EF4444' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.statusButton,
                  status === option.value && {
                    backgroundColor: option.color + '20',
                    borderColor: option.color,
                  },
                ]}
                onPress={() => setStatus(option.value)}
              >
                <View
                  style={[
                    styles.statusRadio,
                    status === option.value && { backgroundColor: option.color },
                  ]}
                />
                <Text
                  style={[
                    styles.statusButtonText,
                    status === option.value && { color: option.color },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Icon name="save" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Submit Assessment</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Image Viewer Modal */}
      <Modal
        isVisible={isImageModalVisible}
        onBackdropPress={() => setImageModalVisible(false)}
        style={styles.imageModal}
      >
        <ImageViewer
          imageUrls={images}
          index={selectedImageIndex}
          enableSwipeDown
          onSwipeDown={() => setImageModalVisible(false)}
          renderHeader={() => (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setImageModalVisible(false)}
            >
              <Icon name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F9FAFB',
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
  },
  backButton: {
    marginTop: 24,
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
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  claimHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  claimIdBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 10,
  },
  claimIdText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  locationText: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
  },
  noLocationText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  descriptionText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 12,
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
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  reportInput: {
    minHeight: 150,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 15,
    color: '#1E293B',
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 8,
  },
  statusOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  statusRadio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: 8,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  imageModal: {
    margin: 0,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  map: {
  width: '100%',
  height: 200,
  borderRadius: 12,
  marginTop: 10,
}

});

export default AgentClaimDetails;