import React from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Animated,
  Easing
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function VerificationSuccess({ navigation, route }) {
  const email = route.params?.email || "your-email@domain.com";
  const nextScreen = route.params?.nextScreen || "TravelProfile";
  
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Animate the icon and content on mount
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
        <Animated.View 
          style={[
            styles.content,
            { opacity: fadeAnim }
          ]}
        >
          <Animated.View 
            style={[
              styles.iconContainer,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            <Ionicons name="checkmark-circle" size={90} color="#D4105D" />
            {/* Animated rings */}
            <View style={styles.ring1} />
            <View style={styles.ring2} />
          </Animated.View>
          
          <Text style={styles.title}>Verification Successful!</Text>
          
          <Text style={styles.subtitle}>
            Welcome to <Text style={styles.brandText}>Shield</Text>. Your email has been successfully verified and your account is now secure.
          </Text>
          
          <View style={styles.emailContainer}>
            <Ionicons name="mail-outline" size={18} color="#D4105D" />
            <Text style={styles.emailText}>{email}</Text>
          </View>
          
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={20} color="#D4105D" />
              <Text style={styles.featureText}>Account Secured</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-done" size={20} color="#D4105D" />
              <Text style={styles.featureText}>Email Verified</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="rocket" size={20} color="#D4105D" />
              <Text style={styles.featureText}>Ready to Explore</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={handleContinue}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>Continue </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
          </TouchableOpacity>
        </Animated.View>
        
        <View style={styles.footer}>
          <View style={styles.securityNote}>
            <Ionicons name="lock-closed" size={16} color="#27AE60" />
            <Text style={styles.footerText}>
              Your personal information is protected with encryption
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
    paddingHorizontal: 10,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#FFE8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 35,
    boxShadow: "0px 8px 16px rgba(212, 16, 93, 0.2)",
    elevation: 10,
    position: "relative",
  },
  ring1: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: "#D4105D",
    opacity: 0.3,
  },
  ring2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#D4105D",
    opacity: 0.2,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#262626",
    textAlign: "center",
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 17,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  brandText: {
    color: "#D4105D",
    fontWeight: "bold",
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 30,
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  emailText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#262626",
    marginLeft: 10,
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  featureItem: {
    alignItems: "center",
    flex: 1,
    padding: 10,
  },
  featureText: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
    fontWeight: "500",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D4105D",
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    boxShadow: "0px 4px 8px rgba(212, 16, 93, 0.3)",
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginLeft: 8,
    fontWeight: "500",
  },
});