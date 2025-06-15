import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../services/api';

const TestConnectionScreen = () => {
  const [responseMessage, setResponseMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await api.get('/api/ping');
        setMessage(response.data.message); // Should be: "Backend connected successfully!"
      } catch (error) {
        console.error('Error connecting to backend:', error.message);
        setMessage('Failed to connect to backend.');
      }
    };

    checkBackend();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <Text style={styles.text}>{responseMessage}</Text>
      )}
    </View>
  );
};

export default TestConnectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
});
