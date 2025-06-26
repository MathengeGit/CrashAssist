import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Driver');
  const [insuranceCompany, setInsuranceCompany] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({});

  const insuranceCompanies = ['APA', 'Britam', 'Jubilee', 'UAP', 'Madison'];

  const validateInputs = () => {
    const newErrors = {};
    if (!name) newErrors.name = 'Full name is required';
    if (!phone) newErrors.phone = 'Phone number is required';
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (!vehicleNumber && role === 'Driver')
      newErrors.vehicleNumber = 'Vehicle plate is required';
    if (!insuranceCompany && role === 'Driver')
      newErrors.insuranceCompany = 'Please select your insurance company';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      const res = await axios.post(
        'https://claimit-backend-q4jj.onrender.com/api/auth/signup',
        {
          name,
          phone,
          email,
          password,
          role,
          vehicleNumber,
          insuranceCompany: role === 'Driver' ? insuranceCompany : null,
        }
      );

      console.log('✅ User registered:', res.data);
      setShowSuccessModal(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed';
      alert(msg);
      console.error('Signup error:', msg);
    } finally {
      setLoading(false);
    }
  };

  const closeModalAndNavigate = () => {
    setShowSuccessModal(false);
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign up</Text>

      <Text style={styles.label}>
        Full Name <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        placeholder="Enter full name"
        value={name}
        onChangeText={(text) => {
          setName(text);
          setErrors((prev) => ({ ...prev, name: '' }));
        }}
        style={styles.input}
      />
      {errors.name && <Text style={styles.error}>{errors.name}</Text>}

      <Text style={styles.label}>
        Phone Number <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        placeholder="Enter phone number"
        value={phone}
        onChangeText={(text) => {
          setPhone(text);
          setErrors((prev) => ({ ...prev, phone: '' }));
        }}
        keyboardType="phone-pad"
        style={styles.input}
      />
      {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}

      <Text style={styles.label}>
        Email <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        placeholder="Enter email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErrors((prev) => ({ ...prev, email: '' }));
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <Text style={styles.label}>
        Password <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        placeholder="Enter password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setErrors((prev) => ({ ...prev, password: '' }));
        }}
        secureTextEntry
        style={styles.input}
      />
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <Text style={styles.label}>
        Select Role <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={role} onValueChange={setRole} style={styles.picker}>
          <Picker.Item label="Driver" value="Driver" />
          <Picker.Item label="Insurance Agent" value="InsuranceAgent" />
        </Picker>
      </View>

      {role === 'Driver' && (
        <>
          <Text style={styles.label}>
            Vehicle Plate Number <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            placeholder="e.g., KDA 123A"
            value={vehicleNumber}
            onChangeText={(text) => {
              setVehicleNumber(text);
              setErrors((prev) => ({ ...prev, vehicleNumber: '' }));
            }}
            style={styles.input}
          />
          {errors.vehicleNumber && <Text style={styles.error}>{errors.vehicleNumber}</Text>}

          <Text style={styles.label}>
            Select Insurance Company <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={insuranceCompany}
              onValueChange={(value) => {
                setInsuranceCompany(value);
                setErrors((prev) => ({ ...prev, insuranceCompany: '' }));
              }}
              style={styles.picker}
            >
              <Picker.Item label="-- Select Company --" value="" />
              {insuranceCompanies.map((company) => (
                <Picker.Item key={company} label={company} value={company} />
              ))}
            </Picker>
          </View>
          {errors.insuranceCompany && (
            <Text style={styles.error}>{errors.insuranceCompany}</Text>
          )}
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      <Text onPress={() => navigation.navigate('Login')} style={styles.link}>
        Already have an account? Log in
      </Text>

      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle-outline" size={64} color="green" />
            <Text style={styles.modalText}>Signup Successful!</Text>
            <TouchableOpacity onPress={closeModalAndNavigate} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#eee', padding: 10, marginBottom: 5, borderRadius: 6 },
  error: { color: 'red', fontSize: 12, marginBottom: 8 },
  label: { marginTop: 10, marginBottom: 5, fontWeight: 'bold' },
  required: { color: 'red' },
  button: { backgroundColor: '#4a90e2', padding: 15, borderRadius: 6, marginTop: 10 },
  buttonText: { textAlign: 'center', color: '#fff', fontWeight: 'bold' },
  link: { marginTop: 15, textAlign: 'center', color: '#4a90e2' },
  pickerContainer: {
    backgroundColor: '#eee',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 5,
  },
  picker: {
    height: Platform.OS === 'ios' ? 200 : 50,
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 250,
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginVertical: 15,
  },
  modalButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 6,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
