import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import OTPScreen from "../screens/otp";
import VerificationSuccess from "../screens/VerificationSuccess";
import TravelProfileScreen from "../screens/TravelProfileScreen";
import KYCSimulation from "../screens/KYCSimulation";
import TripDetails from "../screens/TripDetails";
import DigitalId from "../screens/DigitalId";
import PlaceDetail from "../screens/PlaceDetail";
import ProfileScreen from "../screens/ProfileScreen";
import ScanTourist from "../screens/ScanTourist";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#f4511e",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OTP"
        component={OTPScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VerificationSuccess"
        component={VerificationSuccess}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TravelProfile"
        component={TravelProfileScreen}
        options={{ title: "Select Travel Profile" }}
      />
      <Stack.Screen
        name="KYCSimulation"
        component={KYCSimulation}
        options={{ title: "KYC Verification" }}
      />
      <Stack.Screen
        name="TripDetails"
        component={TripDetails}
        options={{ title: "Trip Details" }}
      />
      <Stack.Screen
        name="DigitalID"
        component={DigitalId}
        options={{ title: "Digital ID" }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Home" }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      <Stack.Screen
        name="ScanTourist"
        component={ScanTourist}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PlaceDetail"
        component={PlaceDetail}
        options={{ title: "PlaceDetail" }}
      />
    </Stack.Navigator>
  );
}
