// navigation/DriverNavigator.js
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DriverStack from './DriverStack';

const Tab = createBottomTabNavigator();

export default function DriverNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={DriverStack} />
    </Tab.Navigator>
  );
}
