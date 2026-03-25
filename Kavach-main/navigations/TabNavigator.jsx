import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import HomePage from "../screens/HomePage";
import ProfileScreen from '../screens/ProfileScreen';
import SafeRouteMap from '../screens/SafeRouteMap';
import ThreeSixtyDeg from '../screens/ThreeSixtyDeg';
import MovementDetector from '../screens/MovementDetector';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <>
      {/* MovementDetector starts ONLY after user reaches the main dashboard */}
      <MovementDetector />
      <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'LiveLocation':
              iconName = focused ? 'scan' : 'scan-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'SafeRoute':
              iconName = focused ? 'map' : 'map-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: '#3182CE', // Trust Blue
        tabBarInactiveTintColor: '#94A3B8', // Slate 400
        tabBarShowLabel: false, // Cleaner without labels, relying on pill highlight
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 30 : 20,
          left: 20,
          right: 20,
          backgroundColor: '#ffffff',
          borderRadius: 30,
          height: 64,
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 15,
          elevation: 10,
          paddingBottom: 0, // Override default padding
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomePage}
      />
      <Tab.Screen 
        name="SafeRoute" 
        component={SafeRouteMap}
      />
      <Tab.Screen 
        name="LiveLocation" 
        component={ThreeSixtyDeg}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
      />
    </Tab.Navigator>
    </>
  );
}