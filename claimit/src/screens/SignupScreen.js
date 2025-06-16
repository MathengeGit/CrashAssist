import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('driver'); // or allow toggle

  const handleSignup = async () => {
    try {
      const res = await axios.post('https://cool-mangos-battle.loca.lt/api/auth/signup', {
        email, password, role
      });
      console.log('User registered:', res.data);
      // navigation.navigate('Login');
    } catch (err) {
      console.error(err.response?.data?.message || 'Signup error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign up</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
      <Text onPress={() => navigation.navigate('Login')} style={styles.link}>
        Already have an account? Log in
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#eee', padding: 10, marginBottom: 10, borderRadius: 6 },
  button: { backgroundColor: '#4a90e2', padding: 15, borderRadius: 6 },
  buttonText: { textAlign: 'center', color: '#fff', fontWeight: 'bold' },
  link: { marginTop: 10, textAlign: 'center', color: '#4a90e2' }
});
