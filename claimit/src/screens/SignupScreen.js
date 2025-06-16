import React, { useState, useEffect } from 'react';
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
  const [role, setRole] = useState('driver');
  const [insuranceAgentId, setInsuranceAgentId] = useState('');
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await axios.get('https://sour-foxes-cheat.loca.lt/api/agents');
        setAgents(res.data);
      } catch (err) {
        console.error('❌ Error loading agents:', err.message);
      }
    };

    if (role === 'driver') {
      fetchAgents();
    }
  }, [role]);

  const handleSignup = async () => {
    if (!name || !phone || !email || !password || (role === 'driver' && !insuranceAgentId)) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('https://sour-foxes-cheat.loca.lt/api/auth/signup', {
        name,
        phone,
        email,
        password,
        role,
        insuranceAgentId: role === 'driver' ? insuranceAgentId : null,
      });

      console.log('✅ User registered:', res.data);
      setShowSuccessModal(true);
      setLoading(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed';
      alert(msg);
      console.error('Signup error:', msg);
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

      <TextInput placeholder="Full Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

      <Text style={styles.label}>Select Role</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={role} onValueChange={setRole} style={styles.picker}>
          <Picker.Item label="Driver" value="driver" />
          <Picker.Item label="Insurance Agent" value="InsuranceAgent" />
        </Picker>
      </View>

      {role === 'driver' && (
        <>
          <Text style={styles.label}>Select Insurance Agent</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={insuranceAgentId}
              onValueChange={setInsuranceAgentId}
              style={styles.picker}
            >
              <Picker.Item label="-- Select Agent --" value="" />
              {agents.map(agent => (
                <Picker.Item key={agent._id} label={agent.email} value={agent._id} />
              ))}
            </Picker>
          </View>
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
  input: { backgroundColor: '#eee', padding: 10, marginBottom: 10, borderRadius: 6 },
  button: { backgroundColor: '#4a90e2', padding: 15, borderRadius: 6, marginTop: 10 },
  buttonText: { textAlign: 'center', color: '#fff', fontWeight: 'bold' },
  link: { marginTop: 15, textAlign: 'center', color: '#4a90e2' },
  label: { marginTop: 10, marginBottom: 5, fontWeight: 'bold' },
  pickerContainer: {
    backgroundColor: '#eee',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
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
