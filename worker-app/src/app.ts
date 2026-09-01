import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/home/home-screen';
import JobsScreen from './screens/jobs/jobs-screen';
import EarningsScreen from './screens/earnings/earnings-screen';
import ProfileScreen from './screens/profile/profile-screen';
import { SOSButton } from './components/sos-button';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Jobs" component={JobsScreen} />
        <Tab.Screen name="Earnings" component={EarningsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
      <SOSButton />
    </NavigationContainer>
  );
};

export default App;