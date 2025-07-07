// App.js
import 'react-native-get-random-values';
import React from 'react';
import 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';


import AppNavigator from './src/navigation/AppNavigator'; // ✅ Already includes NavigationContainer

export default function App() {
  return (
    <>
      <AppNavigator />
      <Toast />
    </>
  );
}
