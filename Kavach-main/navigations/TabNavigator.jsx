import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomePage from "../screens/HomePage";
import DigitalId from '../screens/DigitalId';
import PanicButtonScreen from '../screens/Panic';
import ThreeSixtyDeg from '../screens/ThreeSixtyDeg';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'LiveLocation':
              iconName = focused ? 'location' : 'location-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Panic':
              iconName = focused ? 'alert-circle' : 'alert-circle-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#d4105d',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          elevation: 8,
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          shadowOffset: {
            width: 0,
            height: -3,
          },
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomePage}
        options={{
          tabBarLabel: 'Home'
        }}
      />
      <Tab.Screen 
        name="LiveLocation" 
        component={ThreeSixtyDeg}
        options={{
          tabBarLabel: 'Live Location'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={DigitalId}
        options={{
          tabBarLabel: 'Profile'
        }}
      />
      <Tab.Screen 
        name="Panic" 
        component={PanicButtonScreen}
        options={{
          tabBarLabel: 'Emergency'
        }}
      />
    </Tab.Navigator>
  );
}