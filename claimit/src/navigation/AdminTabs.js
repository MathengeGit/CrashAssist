// navigation/AdminTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminAgentsScreen from '../screens/AdminAgentsScreen';
import AdminAnalyticsScreen from '../screens/AdminAnalyticsScreen';
import AdminSettingsScreen from '../screens/AdminSettingsScreen';

const Tab = createBottomTabNavigator();

const AdminTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Dashboard':
              iconName = 'assignment';
              break;
            case 'Agents':
              iconName = 'supervisor-account';
              break;
            case 'Analytics':
              iconName = 'bar-chart';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'dashboard';
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
          height: 85,
          paddingTop: 6,
          borderTopWidth: 0.4,
          borderTopColor: '#CBD5E1',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Agents" component={AdminAgentsScreen} />
      <Tab.Screen name="Analytics" component={AdminAnalyticsScreen} />
      <Tab.Screen name="Settings" component={AdminSettingsScreen} />
    </Tab.Navigator>
  );
};

export default AdminTabs;
