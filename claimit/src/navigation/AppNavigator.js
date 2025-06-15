import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TestConnectionScreen from '../screens/TestConnectionScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TestConnection">
        <Stack.Screen 
          name="TestConnection" 
          component={TestConnectionScreen} 
          options={{ title: 'Connection Test' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
