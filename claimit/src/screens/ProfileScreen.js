import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const INSURANCE_COMPANIES = ['APA', 'Britam', 'Jubilee', 'AAR', 'ICEA Lion'];

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get('https://claimit-backend-q4jj.onrender.com/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDriver(res.data.user);
      setForm(res.data.user);
    } catch (err) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.put('https://claimit-backend-q4jj.onrender.com/api/auth/profile', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDriver(res.data.user);
      setEditMode(false);
      Alert.alert('Success', 'Profile updated');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  if (!driver) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Driver Profile</Text>

      <View style={styles.card}>
        <ProfileField
          icon="person"
          label="Full Name"
          value={form.name}
          editable={editMode}
          onChange={(text) => setForm({ ...form, name: text })}
        />
        <ProfileField
          icon="email"
          label="Email"
          value={form.email}
          editable={false}
        />
        <ProfileField
          icon="phone"
          label="Phone"
          value={form.phone}
          editable={editMode}
          onChange={(text) => setForm({ ...form, phone: text })}
        />
        <ProfileField
          icon="directions-car"
          label="Vehicle Plate"
          value={form.vehicleNumber}
          editable={editMode}
          onChange={(text) => setForm({ ...form, vehicleNumber: text })}
        />

        {/* Insurance Company Dropdown */}
        <View style={styles.item}>
          <Icon name="business" size={22} color="#0F172A" style={styles.icon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Insurance</Text>
            {editMode ? (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={form.insuranceCompany}
                  onValueChange={(itemValue) =>
                    setForm({ ...form, insuranceCompany: itemValue })
                  }
                >
                  <Picker.Item label="Select your insurance" value="" />
                  {INSURANCE_COMPANIES.map((company) => (
                    <Picker.Item label={company} value={company} key={company} />
                  ))}
                </Picker>
              </View>
            ) : (
              <Text style={styles.value}>
                {form.insuranceCompany || 'Not set'}
              </Text>
            )}
          </View>
        </View>

        {/* Agent display */}
        {driver.insuranceAgent && (
          <View style={styles.item}>
            <Icon name="supervisor-account" size={22} color="#0F172A" style={styles.icon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Insurance Agent</Text>
              <Text style={styles.value}>
                {driver.insuranceAgent.name} ({driver.insuranceAgent.email})
              </Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={editMode ? handleSave : () => setEditMode(true)}
      >
        <Text style={styles.editText}>{editMode ? 'Save Changes' : 'Edit Profile'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const ProfileField = ({ icon, label, value, editable = false, onChange }) => (
  <View style={styles.item}>
    <Icon name={icon} size={22} color="#0F172A" style={styles.icon} />
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      {editable ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
        />
      ) : (
        <Text style={styles.value}>{value || 'Not set'}</Text>
      )}
    </View>
  </View>
);

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#0F172A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  icon: {
    marginRight: 14,
    marginTop: 6,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  pickerContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    marginTop: 4,
  },
  editButton: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  editText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
