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
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authAPI } from "../services/api";

export default function TouristSignUpScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (text.length > 0) {
      setIsValidEmail(validateEmail(text));
    } else {
      setIsValidEmail(true);
    }
  };

  const handleSendOTP = async () => {
    if (!validateEmail(email)) {
      setIsValidEmail(false);
      return;
    }
    if (!name || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.sendOTP(email.toLowerCase().trim());
      navigation.navigate("OTP", { 
        email: email.toLowerCase().trim(),
        name: name,
        password: password
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.welcomeSection}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark" size={48} color="#3182CE" />
              </View>
              <Text style={styles.welcomeTitle}>Create Your Account</Text>
              <Text style={styles.welcomeSubtitle}>
                Enter your details to get started with your secure profile
              </Text>
            </View>

            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#94A3B8"
                  style={styles.emailIcon}
                />
                <TextInput
                  style={styles.emailInput}
                  placeholder="Enter your full name"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[
                styles.inputContainer,
                !isValidEmail && styles.inputContainerError
              ]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#94A3B8"
                  style={styles.emailIcon}
                />
                <TextInput
                  style={styles.emailInput}
                  placeholder="Enter your email address"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {!isValidEmail && (
                <Text style={styles.errorText}>Please enter a valid email address</Text>
              )}
            </View>

            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#94A3B8"
                  style={styles.emailIcon}
                />
                <TextInput
                  style={styles.emailInput}
                  placeholder="Create a secure password"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                (email.length === 0 || loading) && styles.primaryButtonDisabled
              ]}
              onPress={handleSendOTP}
              disabled={email.length === 0 || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Send Verification Code</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By continuing, you agree to our{" "}
                <Text style={styles.highlightText}>Terms of Service</Text> and{" "}
                <Text style={styles.highlightText}>Privacy Policy</Text>
              </Text>
            </View>
          </View>

          {/* Help */}
          <View style={styles.helpSection}>
            <TouchableOpacity style={styles.helpButton}>
              <Ionicons name="help-circle-outline" size={16} color="#3182CE" />
              <Text style={styles.helpText}>Need help? Contact support</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#ffffff",
  },
  // ✅ No justifyContent here — prevents layout jump on keyboard show
  keyboardView: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  // ✅ ScrollView handles the layout, grows to fill space
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  welcomeSection: {
    marginBottom: 40,
    alignItems: "center",
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: "rgba(49, 130, 206, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  inputField: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#0F172A",
    paddingLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputContainerFocused: {
    borderColor: "#3182CE",
    backgroundColor: "#ffffff",
    boxShadow: "0px 4px 8px rgba(49, 130, 206, 0.1)",
    elevation: 4,
  },
  inputContainerError: {
    borderColor: "#EF4444",
  },
  emailIcon: {
    marginRight: 12,
  },
  emailInput: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: "#0F172A",
    width: "100%",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 6,
    paddingLeft: 4,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F172A",
    height: 56,
    borderRadius: 16,
    boxShadow: "0px 4px 8px rgba(15, 23, 42, 0.2)",
    elevation: 6,
    marginBottom: 24,
  },
  primaryButtonDisabled: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 0,
  },
  termsContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  termsText: {
    color: "#94A3B8",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  highlightText: {
    color: "#0F172A",
    fontWeight: "600",
  },
  helpSection: {
    padding: 24,
    alignItems: "center",
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(49, 130, 206, 0.05)",
    borderRadius: 20,
  },
  helpText: {
    marginLeft: 5,
    fontWeight: "500",
  },
});