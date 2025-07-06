// navigation/DriverRootNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DriverTabs from './DriverTabs';
import ReportIncident1 from '../screens/ReportIncident1';
import ReportIncident2 from '../screens/ReportIncident2'; 
import ReportIncident3 from '../screens/ReportIncident3';
import ClaimDetailScreen from '../screens/ClaimDetailScreen'; // ✅ THIS LINE FIXES THE ERROR
import ChatScreen from '../screens/ChatScreen'; // 👈 Add this

const Stack = createNativeStackNavigator();

export default function DriverRootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DriverTabs" component={DriverTabs} />
      <Stack.Screen name="ReportIncident1" component={ReportIncident1} />
      <Stack.Screen name="ReportIncident2" component={ReportIncident2} />
      <Stack.Screen name="ReportIncident3" component={ReportIncident3} />
      <Stack.Screen name="ClaimDetail" component={ClaimDetailScreen} options={{ title: 'Claim Details' }} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
    </Stack.Navigator>
  );
}
