import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const sendOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      console.log('📧 Sending OTP to:', email.toLowerCase().trim());
      const data = await authAPI.sendOTP(email.toLowerCase().trim());
      console.log('✅ Send OTP response:', data);
      
      Alert.alert(
        'Success', 
        data?.warning 
          ? 'OTP generated! Check your email (delivery may be delayed).'
          : 'OTP sent to your email!',
        [
          {
            text: 'Continue',
            onPress: () => {
              navigation.navigate('OTP', { 
                email: email.toLowerCase().trim(),
                fromScreen: 'Login'
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Send OTP Error:', error);
      Alert.alert('Error', error.message || 'Failed to send OTP. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.brandingContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={48} color="#3182CE" />
            </View>
            <Text style={styles.title}>Welcome to Shield</Text>
            <Text style={styles.subtitle}>Sign in to access your secure profile</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[
              styles.inputContainer,
              isFocused && styles.inputContainerFocused
            ]}>
              <Ionicons 
                name="mail-outline" 
                size={20} 
                color={isFocused ? "#3182CE" : "#94A3B8"} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, (!email.trim() || loading) && styles.buttonDisabled]}
              onPress={sendOTP}
              disabled={!email.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Send Verification Code</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.googleButton}
              onPress={() => Alert.alert('Info', 'Google Sign-in will be implemented later')}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to Shield's Terms of Service and Privacy Policy
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
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
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
  },
  brandingContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: "rgba(49, 130, 206, 0.1)", // Trust Blue tinted
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A", // Deep Navy
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B", // Slate
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
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
    marginBottom: 24,
    minHeight: 56,
  },
  inputContainerFocused: {
    borderColor: "#3182CE",
    backgroundColor: "#ffffff",
    shadowColor: "#3182CE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    width: "100%",
    fontSize: 16,
    color: "#0F172A",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F172A", // Deep Navy
    height: 56,
    borderRadius: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    paddingHorizontal: 16,
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "500",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  googleButtonText: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  footer: {
    padding: 24,
    alignItems: "center",
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
  },
  footerText: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 18,
  },
});