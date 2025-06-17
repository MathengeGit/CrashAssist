import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';

const ReportIncident2 = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { imageUri } = route.params;

  const [location, setLocation] = useState(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission denied', 'Please allow location access.');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  const handleNext = () => {
    if (!location || !description) {
      Alert.alert('Missing Fields', 'Please complete all fields before continuing.');
      return;
    }

    navigation.navigate('ReportIncident3', {
      imageUri,
      description,
      date,
      location,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step 2: Add Location & Details</Text>

      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
        <Text style={styles.dateText}>📅 {date.toLocaleString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(e, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>📍 Location (auto-filled)</Text>
      <Text style={styles.locationText}>
        {location ? `Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}` : 'Getting location...'}
      </Text>

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
    </View>
  );
};

export default ReportIncident2;

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
  },
  locationText: {
    color: '#64748B',
    marginBottom: 10,
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
