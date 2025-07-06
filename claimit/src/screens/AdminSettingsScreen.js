// screens/AdminSettingsScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AdminSettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Admin Settings (coming soon)</Text>
    </View>
  );
};

export default AdminSettingsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, fontWeight: '600' },
});
