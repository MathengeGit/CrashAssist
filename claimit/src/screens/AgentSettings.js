import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AgentSettings = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get('https://metal-seals-like.loca.lt/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data.user);
        setForm({
          name: res.data.user.name,
          email: res.data.user.email,
          phone: res.data.user.phone || ''
        });
      } catch (err) {
        console.error('Error loading profile:', err);
        Alert.alert('Error', 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put('https://metal-seals-like.loca.lt/api/auth/update-profile', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Success', 'Profile updated.');
      setEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      Alert.alert('Error', 'Could not update profile.');
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Agent Profile</Text>

      <TextInput
        style={styles.input}
        value={form.name}
        editable={editing}
        onChangeText={text => setForm({ ...form, name: text })}
        placeholder="Full Name"
      />
      <TextInput
        style={styles.input}
        value={form.email}
        editable={false}
        placeholder="Email"
      />
      <TextInput
        style={styles.input}
        value={form.phone}
        editable={editing}
        onChangeText={text => setForm({ ...form, phone: text })}
        placeholder="Phone Number"
      />

      {!editing ? (
        <TouchableOpacity style={styles.button} onPress={() => setEditing(true)}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default AgentSettings;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8FAFC' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderColor: '#CBD5E1',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#FFF'
  },
  button: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  }
});
