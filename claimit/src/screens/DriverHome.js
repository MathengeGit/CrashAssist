import React from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const handleLogout = async () => {
  await AsyncStorage.clear();
  navigation.replace('Login');
};

export default function DriverHome() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>🚗 Driver Dashboard</Text>
    </View>
  );
}
