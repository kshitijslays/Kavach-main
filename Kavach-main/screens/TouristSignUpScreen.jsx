import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TouristSignUpScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isTouched, setIsTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (isTouched) {
      setIsValidEmail(validateEmail(text));
    }
  };

  const handleSendOTP = async () => {
    console.log("=== SEND OTP CLICKED ===");
    console.log("Email:", email);
    console.log("Is valid email:", validateEmail(email));
    
    setIsTouched(true);
    
    // Validate email
    if (!validateEmail(email)) {
      console.log("Invalid email, showing error");
      setIsValidEmail(false);
      return;
    }

    setIsLoading(true);
    setIsValidEmail(true);

    try {
      console.log("Attempting to navigate to OTP screen...");
      
      // Simulate API call delay to see if that's the issue
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to OTP screen
      navigation.navigate("OTP", { 
        email: email,
        source: "send-otp" // Add identifier to track the source
      });
      
      console.log("Navigation successful");
      
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Error", "Failed to navigate to OTP screen");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    console.log("=== RESEND OTP CLICKED ===");
    console.log("Email:", email);
    
    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    // For debugging - simulate what might be happening in your OTP screen
    console.log("Resend OTP logic would be called here");
    
    // If resend works but send doesn't, the issue might be in navigation timing
    // or the OTP screen's initial loading logic
  };

  const isButtonDisabled = !email || !validateEmail(email) || isLoading;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#03474f" />
          </TouchableOpacity>
          <Text style={styles.title}>Tourist Registration</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>
            Enter your email address to receive OTP
          </Text>

          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={[
              styles.inputContainer,
              !isValidEmail && styles.inputContainerError
            ]}>
              <Ionicons name="mail-outline" size={20} color="#999" style={styles.emailIcon} />
              <TextInput
                style={styles.emailInput}
                placeholder="Enter your email address"
                placeholderTextColor="#999"
                value={email}
                onChangeText={handleEmailChange}
                onBlur={() => setIsTouched(true)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
            {!isValidEmail && (
              <Text style={styles.errorText}>Please enter a valid email address</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              isButtonDisabled && styles.primaryButtonDisabled
            ]}
            onPress={handleSendOTP}
            disabled={isButtonDisabled}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? "Sending..." : "Send OTP"}
            </Text>
          </TouchableOpacity>

          {/* Debug Info - Remove in production */}
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>Debug Info:</Text>
            <Text style={styles.debugText}>Email: {email || "empty"}</Text>
            <Text style={styles.debugText}>Valid: {validateEmail(email) ? "Yes" : "No"}</Text>
            <Text style={styles.debugText}>Touched: {isTouched ? "Yes" : "No"}</Text>
            <Text style={styles.debugText}>Loading: {isLoading ? "Yes" : "No"}</Text>
          </View>

          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>

          {/* Test Resend Button for debugging */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleResendOTP}
          >
            <Text style={styles.secondaryButtonText}>Test Resend OTP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.helpSection}>
          <Text style={styles.helpText}>Need help? Contact support</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  backButton: {
    padding: 5,
  },
  placeholder: {
    width: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#03474f",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
  },
  inputField: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#03474f",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  inputContainerError: {
    borderColor: "#ff3b30",
  },
  emailIcon: {
    marginRight: 10,
  },
  emailInput: {
    flex: 1,
    fontSize: 16,
    color: "#03474f",
  },
  primaryButton: {
    backgroundColor: "#03474f",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primaryButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#03474f",
  },
  secondaryButtonText: {
    color: "#03474f",
    fontSize: 14,
    fontWeight: "bold",
  },
  termsText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  helpSection: {
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  helpText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  errorText: {
    fontSize: 12,
    color: "#ff3b30",
    marginTop: 5,
    marginLeft: 5,
  },
  debugContainer: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#03474f",
  },
  debugText: {
    fontSize: 12,
    color: "#666",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
});