import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const GOOGLE_API_KEY = 'AIzaSyBIPWs7ATDbeply4tZ1syNDPw4o-lj5Pp8'; // Keep for reverse geocoding

const ReportIncident2 = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { imageUri, photoUrls } = route.params || {};

  const mapRef = useRef(null);

  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow location access to continue.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      setLocation(coords);
      fetchAddress(coords.latitude, coords.longitude);
    })();
  }, []);

  const fetchAddress = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      if (data.results?.length > 0) {
        setAddress(data.results[0].formatted_address);
      } else {
        setAddress('Unknown location');
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      setAddress('Error fetching address');
    }
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setLocation({ latitude, longitude });
    fetchAddress(latitude, longitude);
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handleNext = () => {
    if (!location || !description) {
      Alert.alert('Missing Fields', 'Please complete all fields before continuing.');
      return;
    }

    navigation.navigate('ReportIncident3', {
      imageUri: imageUri?.uri || imageUri,
      photoUrls,
      description,
      date: date.toISOString(),
      location,
      address,
    });
  };

  const handleConfirm = (selectedDate) => {
    setDate(selectedDate);
    setDatePickerVisibility(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.step}>Step 2 of 4</Text>
      <Text style={styles.title}>Add Location & Details</Text>

      <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={styles.datePicker}>
        <Text style={styles.dateText}>📅 {date.toLocaleString()}</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        date={date}
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
      />

      <Text style={styles.label}>🗺️ Tap to select location on map</Text>
      <Text style={styles.address}>{address || 'Fetching address...'}</Text>

      {location && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            ...location,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleMapPress}
        >
          <Marker coordinate={location} />
        </MapView>
      )}

      <Text style={styles.label}>📝 Brief Description</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Rear-end collision at roundabout"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Continue to Other Party Info</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default ReportIncident2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  step: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
    color: '#1E293B',
  },
  datePicker: {
    backgroundColor: '#E2E8F0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  dateText: {
    fontSize: 16,
    color: '#334155',
  },
  label: {
    marginTop: 15,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 5,
  },
  address: {
    color: '#64748B',
    fontSize: 14,
    marginBottom: 10,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    textAlignVertical: 'top',
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
    marginTop: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
