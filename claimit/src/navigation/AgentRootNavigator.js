// navigation/AgentRootNavigator.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AgentHome from '../screens/AgentHome';
import AgentClaimDetails from '../screens/AgentClaimDetails'; // or use ClaimAgent if preferred

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
    </Stack.Navigator>
  );
}
