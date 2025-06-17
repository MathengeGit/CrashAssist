// navigation/DriverStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DriverHome from '../screens/DriverHome';
import ReportIncident1 from '../screens/ReportIncident1';
import ClaimsScreen from '../screens/ClaimsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function DriverStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DriverHome" component={DriverHome} />
      <Stack.Screen name="ReportIncident1" component={ReportIncident1} />
      <Stack.Screen name="ClaimsScreen" component={ClaimsScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
