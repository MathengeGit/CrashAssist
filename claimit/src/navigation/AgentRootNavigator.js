// navigation/AgentRootNavigator.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AgentHome from '../screens/AgentHome';
import AgentClaimDetails from '../screens/AgentClaimDetails'; // or use ClaimAgent if preferred
import AgentReports from '../screens/AgentReports';
import AgentMessagesScreen from '../screens/AgentMessagesScreen';
import ChatScreen from '../screens/ChatScreen';
import AgentAnalytics from '../screens/AgentAnalytics';
import AgentSettings from '../screens/AgentSettings';

const Stack = createNativeStackNavigator();

export default function AgentRootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="AgentHome"
        component={AgentHome}
        options={{ title: 'Agent Dashboard' }}
      />
      <Stack.Screen
        name="AgentClaimDetails"
        component={AgentClaimDetails}
        options={{ title: 'Claim Details' }}
      />
      <Stack.Screen name="AgentReports" 
        component={AgentReports} />
      <Stack.Screen
        name="AgentMessages"
        component={AgentMessagesScreen}
        options={{ title: 'Send Message' }}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={({ route }) => ({ title: route.params?.driverName || 'Chat' })}
      />
      <Stack.Screen 
        name="AgentAnalytics" 
        component={AgentAnalytics} 
      />
      <Stack.Screen 
        name="AgentSettings" 
        component={AgentSettings} 
        options={{ title: 'Settings' }} 
      />

    </Stack.Navigator>
  );
}
