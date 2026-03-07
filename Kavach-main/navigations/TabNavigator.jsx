import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomePage from "../screens/HomePage";
import ProfileScreen from '../screens/ProfileScreen';
import SafeRouteMap from '../screens/SafeRouteMap';
import ThreeSixtyDeg from '../screens/ThreeSixtyDeg';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
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

          // Modern pill active state for the icon
          return (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: focused ? 'rgba(49, 130, 206, 0.15)' : 'transparent',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <Ionicons name={iconName} size={22} color={color} />
            </View>
          );
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
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 15,
          shadowOffset: { width: 0, height: 10 },
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
  );
}