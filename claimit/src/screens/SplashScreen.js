import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Optional: Delay for splash screen effect
        await new Promise(resolve => setTimeout(resolve, 2500));

        const token = await AsyncStorage.getItem('token');
        const role = await AsyncStorage.getItem('role');

        if (token && role) {
  let targetScreen = 'Login';

  if (role === 'Driver') targetScreen = 'DriverHome';
  else if (role === 'InsuranceAgent') targetScreen = 'AgentHome';
  else if (role === 'Admin') targetScreen = 'AdminDashboard';

  navigation.reset({
    index: 0,
    routes: [{ name: targetScreen }],
  });
} else {
  navigation.reset({
    index: 0,
    routes: [{ name: 'GetStarted' }],
  });
}

      } catch (error) {
        console.error('SplashScreen Error:', error);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>ClaimIt</Text>
      <ActivityIndicator size="large" color="#4a90e2" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 20,
  },
  spinner: {
    marginTop: 10,
  },
});
