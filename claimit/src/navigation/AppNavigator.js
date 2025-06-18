// navigation/AppNavigator.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import SignupScreen from '../screens/SignupScreen';
import LoginScreen from '../screens/LoginScreen';

import DriverRootNavigator from './DriverRootNavigator';
import AgentHome from '../screens/AgentHome'; // Replace with AgentRootNavigator if needed

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        
        {/* Use the updated Driver Root Navigator here */}
        <Stack.Screen name="DriverHome" component={DriverRootNavigator} />
        <Stack.Screen name="AgentHome" component={AgentHome} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
