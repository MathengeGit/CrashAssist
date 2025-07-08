import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import SplashScreen from '../screens/SplashScreen';
import GetStartedScreen from '../screens/GetStartedScreen';
import SignupScreen from '../screens/SignupScreen';
import LoginScreen from '../screens/LoginScreen';

import DriverRootNavigator from './DriverRootNavigator';
import AgentRootNavigator from './AgentRootNavigator';
import AdminTabs from './AdminTabs';


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState('Splash');

  useEffect(() => {
    const checkUserRole = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('https://claimit-backend-q4jj.onrender.com/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });

          const role = res.data.user.role;

          switch (role) {
            case 'Driver':
              setInitialRoute('DriverHome');
              break;
            case 'InsuranceAgent':
              setInitialRoute('AgentHome');
              break;
            case 'Admin':
              setInitialRoute('AdminDashboard');
              break;
            default:
              setInitialRoute('Login');
          }
        } catch (err) {
          setInitialRoute('Login');
        }
      } else {
        setInitialRoute('Login');
      }
    };

    checkUserRole();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="GetStarted" component={GetStartedScreen} />

        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="DriverHome" component={DriverRootNavigator} />
        <Stack.Screen name="AgentHome" component={AgentRootNavigator} />
        <Stack.Screen name="AdminDashboard" component={AdminTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
