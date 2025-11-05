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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TouristSignUpScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    // Only validate when there's text, don't show error when empty
    if (text.length > 0) {
      setIsValidEmail(validateEmail(text));
    } else {
      setIsValidEmail(true);
    }
  };

  const handleSendOTP = () => {
    if (validateEmail(email)) {
      navigation.navigate("OTP", { email: email });
    } else {
      setIsValidEmail(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#262626" />
          </TouchableOpacity>
          <Text style={styles.title}>Tourist Registration</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.formContainer}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Create Your Account</Text>
            <Text style={styles.welcomeSubtitle}>
              Enter your email to get started with your tourist experience
            </Text>
          </View>

          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={[
              styles.inputContainer,
              isFocused && styles.inputContainerFocused,
              !isValidEmail && styles.inputContainerError
            ]}>
              <Ionicons 
                name="mail-outline" 
                size={20} 
                color={isFocused ? "#D4105D" : "#999"} 
                style={styles.emailIcon} 
              />
              <TextInput
                style={styles.emailInput}
                placeholder="Enter your email address"
                placeholderTextColor="#999"
                value={email}
                onChangeText={handleEmailChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {!isValidEmail && (
              <Text style={styles.errorText}>Please enter a valid email address</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              email.length === 0 && styles.primaryButtonDisabled
            ]}
            onPress={handleSendOTP}
            disabled={email.length === 0}
          >
            <Text style={styles.primaryButtonText}>Send OTP</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By continuing, you agree to our{" "}
            <Text style={styles.highlightText}>Terms of Service</Text> and{" "}
            <Text style={styles.highlightText}>Privacy Policy</Text>
          </Text>
        </View>

        <View style={styles.helpSection}>
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={16} color="#D4105D" />
            <Text style={styles.helpText}>Need help? Contact support</Text>
          </TouchableOpacity>
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
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  placeholder: {
    width: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#262626",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
  },
  welcomeSection: {
    marginBottom: 40,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  inputField: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#262626",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputContainerFocused: {
    borderColor: "#D4105D",
    shadowColor: "#D4105D",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainerError: {
    borderColor: "#ff3b30",
  },
  emailIcon: {
    marginRight: 12,
  },
  emailInput: {
    flex: 1,
    fontSize: 16,
    color: "#262626",
  },
  primaryButton: {
    backgroundColor: "#D4105D",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#D4105D",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonDisabled: {
    backgroundColor: "#ccc",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  buttonIcon: {
    marginLeft: 8,
  },
  termsText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  highlightText: {
    color: "#D4105D",
    fontWeight: "600",
  },
  helpSection: {
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  helpText: {
    fontSize: 13,
    color: "#D4105D",
    textAlign: "center",
    marginLeft: 6,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 13,
    color: "#ff3b30",
    marginTop: 6,
    marginLeft: 5,
    fontWeight: "500",
  },
});