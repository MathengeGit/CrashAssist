import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminAgentsScreen from '../screens/AdminAgentsScreen';
import AdminAnalyticsScreen from '../screens/AdminAnalyticsScreen';
// Add more screens: AdminSettingsScreen, AdminAnalyticsScreen, etc.

const Drawer = createDrawerNavigator();

const AdminDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Claims"
      screenOptions={{ headerShown: true }}
    >
      <Drawer.Screen name="Claims" component={AdminDashboardScreen} />
      <Drawer.Screen name="Agents" component={AdminAgentsScreen} />
      <Drawer.Screen name="Analytics" component={AdminAnalyticsScreen} />
      {/* Add Settings/Analytics here */}
    </Drawer.Navigator>
  );
};

export default AdminDrawerNavigator;
