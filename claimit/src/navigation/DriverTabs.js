// navigation/DriverTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DriverHome from '../screens/DriverHome';
import ClaimsScreen from '../screens/ClaimsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DriverMessagesScreen from '../screens/DriverMessagesScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { View, Text, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();

export default function DriverTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 85,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#CBD5E1',
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName;
          let label = route.name;

          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Claims') iconName = 'description';
          else if (route.name === 'Messages') iconName = 'chat';
          else if (route.name === 'Profile') iconName = 'person';

          return (
            <View style={styles.iconWrapper}>
              <Icon name={iconName} size={24} color={color} />
              <Text
                style={[
                  styles.label,
                  { color: focused ? '#0F172A' : 'gray' },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {label}
              </Text>
            </View>
          );
        },
        tabBarActiveTintColor: '#0F172A',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen name="Home" component={DriverHome} />
      <Tab.Screen name="Claims" component={ClaimsScreen} />
      <Tab.Screen name="Messages" component={DriverMessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  label: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },
});
