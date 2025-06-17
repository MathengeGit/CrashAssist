import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen'; // 👈
import SignupScreen from '../screens/SignupScreen'; // 👈
import LoginScreen from '../screens/LoginScreen';
import DriverNavigator from './DriverNavigator'; // 👈 import your tab nav
import AgentHome from '../screens/AgentHome';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="DriverHome" component={DriverNavigator} />
      <Stack.Screen name="AgentHome" component={AgentHome} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
