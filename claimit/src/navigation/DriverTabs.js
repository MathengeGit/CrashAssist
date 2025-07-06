// navigation/DriverTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DriverHome from '../screens/DriverHome';
import ClaimsScreen from '../screens/ClaimsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DriverMessagesScreen from '../screens/DriverMessagesScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();

export default function DriverTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Claims':
              iconName = 'description';
              break;
            case 'Messages':
              iconName = 'chat';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0F172A',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: '#f8fafc',
          borderTopWidth: 0.5,
          borderTopColor: '#e2e8f0',
          height: 60,
        },
      })}
    >
      <Tab.Screen name="Home" component={DriverHome} />
      <Tab.Screen name="Claims" component={ClaimsScreen} />
      <Tab.Screen name="Messages" component={DriverMessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
