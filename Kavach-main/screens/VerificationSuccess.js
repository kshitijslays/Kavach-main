import React from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function VerificationSuccess({ navigation, route }) {
  const email = route.params?.email || "your-email@domain.com";
  const nextScreen = route.params?.nextScreen || "TravelProfile";

  const handleContinue = () => {
    console.log('🎯 Navigating to:', nextScreen);
    // Navigate immediately for better UX
    navigation.navigate(nextScreen, { 
      userEmail: email,
      fromVerification: true 
    });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#27AE60" />
          </View>
          
          <Text style={styles.title}>Verification Successful!</Text>
          
          <Text style={styles.subtitle}>
            Welcome to Kavach. Your email has been successfully verified.
          </Text>
          
          <Text style={styles.mobileText}>
            Verified email: {email}
          </Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continue to Profile</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your account is now secure and ready to use
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E8F5E8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 15,
    color: "#03474f",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 24,
  },
  mobileText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#03474f",
    marginBottom: 40,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#03474f",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    width: "100%",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});