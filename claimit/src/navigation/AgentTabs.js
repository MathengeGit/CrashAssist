// navigation/AgentTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import AgentHome from '../screens/AgentHome';
import AgentMessagesScreen from '../screens/AgentMessagesScreen';
import AgentAnalytics from '../screens/AgentAnalytics';

const Tab = createBottomTabNavigator();

export default function AgentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Messages':
              iconName = 'chat';
              break;
            case 'Analytics':
              iconName = 'bar-chart';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0F172A',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          paddingBottom: 2,
        },
        tabBarStyle: {
          backgroundColor: '#F8FAFC',
          height: 90,
          paddingTop: 6,
          borderTopWidth: 0.4,
          borderTopColor: '#CBD5E1',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AgentHome} />
      <Tab.Screen name="Messages" component={AgentMessagesScreen} />
      <Tab.Screen name="Analytics" component={AgentAnalytics} />

    </Tab.Navigator>
  );
}
