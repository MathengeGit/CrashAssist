import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from '../services/api';

const ReportIncident3 = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    photoUrls,
    location,
    description,
    date,
  } = route.params;

  const [otherName, setOtherName] = useState('');
  const [otherPhone, setOtherPhone] = useState('');
  const [otherPlate, setOtherPlate] = useState('');
  const [otherInsurance, setOtherInsurance] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async () => {
    if (!otherName || !otherPhone || !otherPlate || !otherInsurance) {
      Alert.alert('Missing Fields', 'Please complete all required fields.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        location,
        date,
        description,
        photos: photoUrls.map(p => p.tempUrl || p.uri || p),
        otherParty: {
          name: otherName,
          contact: otherPhone,
          licensePlate: otherPlate,
          insuranceCompany: otherInsurance,
        },
      };

      await axios.post('/api/claims/report', payload);

      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'DriverHome' }],
        });
      }, 3000);
    } catch (error) {
      console.error(error.message);
      Alert.alert('Error', 'Failed to submit claim. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.step}>Step 3 of 3</Text>
      <Text style={styles.title}>Other Party Details</Text>

      <View style={styles.card}>
        <Text style={styles.label}>📛 Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Jane Wanjiku"
          value={otherName}
          onChangeText={setOtherName}
        />

        <Text style={styles.label}>📞 Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 0712345678"
          keyboardType="phone-pad"
          value={otherPhone}
          onChangeText={setOtherPhone}
        />

        <Text style={styles.label}>🚘 License Plate</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. KCG 345A"
          value={otherPlate}
          onChangeText={setOtherPlate}
        />

        <Text style={styles.label}>🏢 Insurance Company</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. CIC Insurance"
          value={otherInsurance}
          onChangeText={setOtherInsurance}
        />
      </View>

      {photoUrls && photoUrls.length > 0 && (
        <View style={styles.previewRow}>
          {photoUrls.map((photo, i) => {
            const uri = typeof photo === 'string' ? photo : photo.tempUrl || photo.uri;
            return (
              <Image
                key={i}
                source={{ uri }}
                style={styles.previewImage}
              />
            );
          })}
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>✅ Submit Claim</Text>
        )}
      </TouchableOpacity>

      {showModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.tickContainer}>
              <Text style={styles.tick}>✅</Text>
            </View>
            <Text style={styles.modalTitle}>Claim Submitted</Text>
            <Text style={styles.modalSubtitle}>
              Your report was sent successfully. Redirecting to dashboard...
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ReportIncident3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 20,
  },
  step: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#0F172A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    fontSize: 16,
    color: '#0F172A',
  },
  previewRow: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  previewImage: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  tickContainer: {
    backgroundColor: '#D1FAE5',
    borderRadius: 100,
    padding: 20,
    marginBottom: 20,
  },
  tick: {
    fontSize: 40,
    color: '#10B981',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 5,
    color: '#111827',
  },
  modalSubtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
  },
});
