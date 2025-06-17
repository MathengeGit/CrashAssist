import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from '../services/api';

const ReportIncident3 = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    imageUri,
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
      const formData = new FormData();
      formData.append('photo', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'accident.jpg',
      });
      formData.append('description', description);
      formData.append('date', date);
      formData.append('location', JSON.stringify(location));
      formData.append('otherDriver', JSON.stringify({
        name: otherName,
        phone: otherPhone,
        plate: otherPlate,
        insurance: otherInsurance,
      }));

      const res = await axios.post('/claims/report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigation.navigate('DriverHome');
      }, 3000);
    } catch (error) {
      console.error(error.message);
      Alert.alert('Error', 'Failed to submit claim. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step 3: Other Driver's Info</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={otherName}
        onChangeText={setOtherName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={otherPhone}
        onChangeText={setOtherPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="License Plate"
        value={otherPlate}
        onChangeText={setOtherPlate}
      />
      <TextInput
        style={styles.input}
        placeholder="Insurance Company"
        value={otherInsurance}
        onChangeText={setOtherInsurance}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Submit Claim</Text>
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
    </View>
  );
};

export default ReportIncident3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    color: '#1E293B',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  button: {
    backgroundColor: '#0F172A',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
