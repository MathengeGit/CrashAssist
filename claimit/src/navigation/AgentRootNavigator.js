// navigation/AgentRootNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AgentTabs from './AgentTabs';
import AgentClaimDetails from '../screens/AgentClaimDetails';
import AgentReports from '../screens/AgentReports';
import ChatScreen from '../screens/ChatScreen';

const Stack = createNativeStackNavigator();

export default function AgentRootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="AgentTabs"
        component={AgentTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AgentClaimDetails"
        component={AgentClaimDetails}
        options={{ title: 'Claim Details' }}
      />
      <Stack.Screen
        name="AgentReports"
        component={AgentReports}
        options={{ title: 'Reports' }}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={({ route }) => ({
          title: route.params?.driverName || 'Chat',
        })}
      />
    </Stack.Navigator>
  );
}
