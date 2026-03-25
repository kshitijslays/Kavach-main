import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert,
  Platform,
  Animated,
  Easing,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { authAPI } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "../context/UserContext";

const OTP_LENGTH = 6;

export default function OTPScreen({ navigation, route }) {
  const { width } = useWindowDimensions();
  const { login } = useUser();

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);
  // Always-fresh OTP ref — eliminates every stale-closure issue
  const otpRef = useRef(Array(OTP_LENGTH).fill(""));

  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const email = route.params?.email || "";
  const name = route.params?.name || "";
  const password = route.params?.password || "";

  // Countdown
  useEffect(() => {
    if (timer > 0) {
      const id = setInterval(() => setTimer((p) => p - 1), 1000);
      return () => clearInterval(id);
    }
    setIsResendDisabled(false);
  }, [timer]);

  // ─── Input ────────────────────────────────────────────────────────────────

  const handleChange = (text, index) => {
    // Take only the last digit typed (handles paste / replace scenarios)
    const digit = text.replace(/[^0-9]/g, "").slice(-1);

    const next = [...otpRef.current];
    next[index] = digit;
    otpRef.current = next;
    setOtp([...next]);

    if (digit) {
      if (index < OTP_LENGTH - 1) {
        // Small delay so setOtp re-render completes before focus moves
        setTimeout(() => inputRefs.current[index + 1]?.focus(), 10);
      } else {
        // Last digit — submit immediately using the ref (no stale state)
        const joined = next.join("");
        if (joined.length === OTP_LENGTH) submitOtp(joined);
      }
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === "Backspace" && !otpRef.current[index] && index > 0) {
      const next = [...otpRef.current];
      next[index - 1] = "";
      otpRef.current = next;
      setOtp([...next]);
      setTimeout(() => inputRefs.current[index - 1]?.focus(), 10);
    }
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const submitOtp = async (otpString) => {
    if (loading) return;
    if (!otpString || otpString.length !== OTP_LENGTH) {
      shakeInput();
      Alert.alert("Incomplete OTP", "Please enter all 6 digits.");
      return;
    }
    setLoading(true);
    console.log("🔐 Verifying OTP:", otpString);
    try {
      const data = await authAPI.verifyOTP(email, otpString, name, null, password);
      if (data.message?.includes("already in progress")) return;
      if (data.token) await AsyncStorage.setItem("userToken", data.token);
      if (data.user) login(data.user);
      navigation.navigate("TripDetails", {
        userEmail: email,
        fromVerification: true,
        token: data.token,
      });
    } catch (error) {
      console.error("❌ OTP Error:", error);
      Alert.alert("Verification Failed", error.message || "Invalid or expired OTP.");
      shakeInput();
      clearOtp();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPress = () => submitOtp(otpRef.current.join(""));

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const clearOtp = () => {
    const empty = Array(OTP_LENGTH).fill("");
    otpRef.current = empty;
    setOtp([...empty]);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  const shakeInput = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 80, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 80, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 8, duration: 80, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 80, easing: Easing.linear, useNativeDriver: true }),
    ]).start();
  };

  const resendOTP = async () => {
    try {
      setIsResendDisabled(true);
      setTimer(30);
      const result = await authAPI.sendOTP(email);
      clearOtp();
      Alert.alert("OTP Resent",
        result?.warning ? "New OTP generated. Check your email." : "A new OTP has been sent to your email."
      );
    } catch (error) {
      setIsResendDisabled(false);
      setTimer(0);
      Alert.alert("Error", error.message || "Failed to resend OTP.");
    }
  };

  const otpFilled = otp.join("").length === OTP_LENGTH;

  // ─── Render ───────────────────────────────────────────────────────────────

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
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.title}>OTP Verification</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={50} color="#3182CE" />
            </View>

            <Text style={styles.subtitle}>Enter Verification Code</Text>
            <Text style={styles.message}>
              We've sent a 6-digit verification code to your email address
            </Text>
            <Text style={styles.emailText}>{email}</Text>

            <Animated.View
              style={[
                styles.otpContainer,
                { transform: [{ translateX: shakeAnimation }], width: width * 0.85 },
              ]}
            >
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(r) => (inputRefs.current[index] = r)}
                  style={[
                    styles.otpInput,
                    digit ? styles.otpInputFilled : null,
                    focusedIndex === index ? styles.otpInputFocused : null,
                  ]}
                  value={digit}
                  onChangeText={(t) => handleChange(t, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(-1)}
                  keyboardType="number-pad"
                  maxLength={1}
                  // Native autoFocus on first box — no programmatic focus needed on mount
                  autoFocus={index === 0}
                  selectTextOnFocus
                  caretHidden
                />
              ))}
            </Animated.View>

            <TouchableOpacity
              style={[styles.button, (!otpFilled || loading) && styles.buttonDisabled]}
              onPress={handleVerifyPress}
              disabled={!otpFilled || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Verify & Continue</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.timerText}>Didn't receive the code? </Text>
              {isResendDisabled ? (
                <Text style={styles.timerCount}>
                  Resend in 00:{timer < 10 ? `0${timer}` : timer}
                </Text>
              ) : (
                <TouchableOpacity onPress={resendOTP}>
                  <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{" "}
              <Text style={styles.highlightText}>Terms of Service</Text> and{" "}
              <Text style={styles.highlightText}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#fff" },
  keyboardView: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { flexGrow: 1, justifyContent: "space-between" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: 10,
  },
  backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "flex-start" },
  placeholder: { width: 40 },
  title: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
  content: { flex: 1, alignItems: "center", paddingHorizontal: 32, justifyContent: "center" },
  iconContainer: {
    width: 88, height: 88, borderRadius: 24,
    backgroundColor: "rgba(49,130,206,0.1)",
    justifyContent: "center", alignItems: "center", marginBottom: 24,
  },
  subtitle: { fontSize: 28, fontWeight: "800", marginBottom: 8, color: "#0F172A", textAlign: "center" },
  message: { fontSize: 16, color: "#64748B", marginBottom: 8, textAlign: "center", lineHeight: 22, paddingHorizontal: 20 },
  emailText: { fontSize: 16, fontWeight: "700", color: "#3182CE", marginBottom: 40, textAlign: "center" },
  otpContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  otpInput: {
    width: 50, height: 56,
    borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 16,
    textAlign: "center", fontSize: 24, fontWeight: "700",
    backgroundColor: "#F8FAFC", color: "#0F172A",
  },
  otpInputFilled: { borderColor: "#3182CE", backgroundColor: "#fff", elevation: 4 },
  otpInputFocused: { borderColor: "#3182CE", borderWidth: 2, backgroundColor: "#fff", elevation: 4 },
  button: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#0F172A", height: 56, borderRadius: 16,
    width: "100%", marginBottom: 24, elevation: 6,
  },
  buttonDisabled: { backgroundColor: "#94A3B8", elevation: 0 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700", marginRight: 8 },
  buttonIcon: {},
  resendContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", flexWrap: "wrap", marginTop: 8 },
  timerText: { fontSize: 14, color: "#64748B" },
  timerCount: { fontSize: 14, color: "#3182CE", fontWeight: "600" },
  resendText: { fontSize: 14, color: "#3182CE", fontWeight: "700", textDecorationLine: "underline" },
  footer: { padding: 24, alignItems: "center", paddingBottom: Platform.OS === "ios" ? 32 : 24 },
  footerText: { fontSize: 12, color: "#94A3B8", textAlign: "center", lineHeight: 18 },
  highlightText: { color: "#0F172A", fontWeight: "600" },
});