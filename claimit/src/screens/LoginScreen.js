import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import axios from 'axios';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '<YOUR_ANDROID_CLIENT_ID>',
    iosClientId: '<YOUR_IOS_CLIENT_ID>',
    expoClientId: '711038217407-fc508ej7nk5mi6fundbfkgiijvmkdp1d.apps.googleusercontent.com',
  });

  const validateInputs = () => {
    let valid = true;
    if (!email) {
      setEmailError('Email is required');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      const res = await axios.post(
        'https://claimit-backend-q4jj.onrender.com/api/auth/login',
        { email, password }
      );

      const { token, role } = res.data;
      await AsyncStorage.setItem('token', token);

      setSuccessModalVisible(true);

      setTimeout(() => {
        setSuccessModalVisible(false);
        if (role === 'Driver') navigation.navigate('DriverHome');
        else if (role === 'InsuranceAgent') navigation.navigate('AgentHome');
        else if (role === 'Admin') navigation.navigate('AdminDashboard');
        else Alert.alert('Unknown Role', 'Your account role is not recognized.');
      }, 1500);
    } catch (error) {
      console.log('Login error:', error.response?.data || error.message);
      const msg = error.response?.data?.message || 'Login failed. Please try again.';
      Alert.alert('Login Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Claim<Text style={{ color: '#0a66c2' }}>It</Text></Text>
      <View style={styles.card}>
        <Text style={styles.title}>Sign in</Text>

        <TouchableOpacity style={styles.googleBtn} onPress={() => promptAsync()}>
          <Icon name="globe" size={18} color="#444" style={styles.iconLeft} />
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <Text style={styles.label}>
          Email <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        {emailError ? <Text style={styles.error}>{emailError}</Text> : null}

        <Text style={styles.label}>
          Password <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.passwordRow}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={[styles.input, { flex: 1 }]}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.showBtn}>{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>
        {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}

        <TouchableOpacity onPress={() => Alert.alert('Forgot password')}>
          <Text style={styles.link}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Custom Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setKeepLoggedIn(!keepLoggedIn)}
        >
          <View style={[styles.checkboxBox, keepLoggedIn && styles.checkboxChecked]}>
            {keepLoggedIn && <Icon name="check" size={16} color="#fff" />}
          </View>
          <Text style={styles.checkboxLabel}>Keep me logged in</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Sign in'}</Text>
        </TouchableOpacity>

        <Text onPress={() => navigation.navigate('Signup')} style={styles.signupText}>
          Don’t have an account? Sign up
        </Text>
      </View>

      <Modal transparent visible={successModalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Icon name="check-circle" size={50} color="#4BB543" />
            <Text style={styles.modalText}>Login Successful</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  logo: { fontSize: 32, fontWeight: 'bold', color: '#000', alignSelf: 'center', marginBottom: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  googleBtn: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconLeft: { marginRight: 10 },
  googleBtnText: { fontWeight: '500', color: '#444' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  divider: { flex: 1, height: 1, backgroundColor: '#ccc' },
  dividerText: { marginHorizontal: 8, color: '#888' },
  label: { fontWeight: 'bold', marginTop: 10 },
  required: { color: 'red' },
  input: {
    backgroundColor: '#f3f3f3',
    padding: 12,
    borderRadius: 6,
    marginTop: 5,
    marginBottom: 8,
  },
  error: { color: 'red', marginBottom: 8 },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  showBtn: { marginLeft: 10, color: '#4a90e2', fontWeight: '500' },
  link: { color: '#0a66c2', marginBottom: 10 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#0a66c2',
    borderColor: '#0a66c2',
  },
  checkboxLabel: { color: '#333', fontSize: 14 },
  button: {
    backgroundColor: '#0a66c2',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  signupText: { marginTop: 15, textAlign: 'center', color: '#0a66c2' },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  modalText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4BB543',
  },
});
