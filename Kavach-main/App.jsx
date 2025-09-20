// filepath: c:\Users\rakhi\Desktop\Rakshak\App.jsx
import React from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import screens
import authHome from "./screens/authHome.jsx"; // Make sure path is correct
import RoleSelectionScreen from "./screens/RoleSelectionScreen.js";
import TouristSignUpScreen from "./screens/TouristSignUpScreen.jsx";
import AuthorityLoginScreen from "./screens/AuthorityLoginScreen.jsx";
import OTPScreen from "./screens/otp.jsx";
import VerificationSuccess from "./screens/VerificationSuccess";
import TravelProfileScreen from "./screens/TravelProfileScreen";
import KycSimulation from './screens/KYCSimulation.jsx';
import TripDetails from './screens/TripDetails.jsx'
import DigitalId from "./screens/DigitalId.jsx"
import HomePage from "./screens/HomePage.jsx"
import TabNavigator from "./navigations/TabNavigator.jsx";
// import PoliceDashboard from "./screens/PolicDashboard.js";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="RoleSelection"
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === "ios" ? "default" : "fade",
        }}
      >
        <Stack.Screen name="authHome" component={authHome} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="TouristSignUp" component={TouristSignUpScreen} />
        <Stack.Screen name="AuthorityLogin" component={AuthorityLoginScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="VerificationSuccess" component={VerificationSuccess} />
        <Stack.Screen name="TravelProfileScreen" component={TravelProfileScreen} />
        <Stack.Screen name="KycSimulation" component={KycSimulation} />
        <Stack.Screen name="TripDetails" component={TripDetails} />
        <Stack.Screen name="DigitalID" component={DigitalId} />
        <Stack.Screen name="HomePage" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}