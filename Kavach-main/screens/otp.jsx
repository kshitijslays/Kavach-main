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
  useWindowDimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { authAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';

export default function OTPScreen({ navigation, route }) {
  const { width } = useWindowDimensions();
  const { login } = useUser();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRefs = useRef([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const email = route.params?.email || "";
  const name = route.params?.name || "";
  const password = route.params?.password || "";
  const fromScreen = route.params?.fromScreen || "Login";

  useEffect(() => {
    // Start timer on component mount
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsResendDisabled(false);
    }
  }, [timer]);

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto submit if last digit is entered (with delay to prevent double calls)
    if (value && index === 5 && !loading) {
      console.log('🔢 Last digit entered, auto-submitting...');
      setTimeout(() => {
        if (!loading) {
          console.log('⚡ Auto-submit executing...');
          handleNext();
        } else {
          console.log('⚠️ Auto-submit skipped - already loading');
        }
      }, 200); // Slightly longer delay
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace to move to previous input
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(-1);
  };

  const handleNext = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length === 6 && !loading) {
      setLoading(true);
      console.log('🔐 Starting OTP verification for:', email);
      
      try {
        console.log('🔐 Verifying OTP:', enteredOtp, 'for email:', email);
        const data = await authAPI.verifyOTP(email, enteredOtp, name, null, password);
        console.log('✅ OTP verification response:', data);
        
        // Check if it's a duplicate request message
        if (data.message?.includes('already in progress')) {
          console.log('⚠️ Duplicate request, ignoring...');
          return;
        }
        
        // Save token to AsyncStorage for later use
        if (data.token) {
          await AsyncStorage.setItem('userToken', data.token);
          console.log('✅ Token saved to AsyncStorage');
        }
        
        if (data.user) {
          login(data.user);
        }

        console.log('🎉 Navigating to next screen...');
        navigation.navigate('TripDetails', {
          userEmail: email,
          fromVerification: true,
          token: data.token,
        });
      } catch (error) {
        console.error('❌ Verify OTP Error:', error);
        Alert.alert(
          'Verification Failed', 
          error.message || 'Invalid or expired OTP. Please try again or request a new OTP.'
        );
        shakeInput();
        setOtp(["", "", "", "", "", ""]);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Shake animation for invalid OTP
      shakeInput();
      Alert.alert("Invalid OTP", "Please enter a valid 6-digit OTP");
    }
  };

  const shakeInput = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { 
        toValue: 10, 
        duration: 100, 
        easing: Easing.linear,
        useNativeDriver: true 
      }),
      Animated.timing(shakeAnimation, { 
        toValue: -10, 
        duration: 100, 
        easing: Easing.linear,
        useNativeDriver: true 
      }),
      Animated.timing(shakeAnimation, { 
        toValue: 10, 
        duration: 100, 
        easing: Easing.linear,
        useNativeDriver: true 
      }),
      Animated.timing(shakeAnimation, { 
        toValue: 0, 
        duration: 100, 
        easing: Easing.linear,
        useNativeDriver: true 
      })
    ]).start();
  };

  const resendOTP = async () => {
    try {
      console.log('📧 Resending OTP to:', email);
      setIsResendDisabled(true);
      setTimer(30);
      
      const result = await authAPI.sendOTP(email);
      console.log('✅ Resend OTP result:', result);
      
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
      
      Alert.alert(
        "OTP Resent", 
        result?.warning 
          ? "New OTP generated. Check your email or try the previous OTP if this fails."
          : "A new OTP has been sent to your email"
      );
    } catch (error) {
      console.error('❌ Resend OTP Error:', error);
      setIsResendDisabled(false);
      setTimer(0);
      Alert.alert(
        'Error', 
        error.message || 'Failed to resend OTP. Please try again.'
      );
    }
  };

  const translateX = shakeAnimation.interpolate({
    inputRange: [-10, 10],
    outputRange: [-10, 10]
  });

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
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.title}>OTP Verification</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={50} color="#3182CE" />
            </View>
          
          <Text style={styles.subtitle}>
            Enter Verification Code
          </Text>
          
          <Text style={styles.message}>
            We've sent a 6-digit verification code to your email address
          </Text>
          
          <Text style={styles.emailText}>
            {email}
          </Text>

          <Animated.View style={[styles.otpContainer, { transform: [{ translateX : shakeAnimation }], width: width * 0.85 }]}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  focusedIndex === index && styles.otpInputFocused
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={() => handleFocus(index)}
                onBlur={handleBlur}
                keyboardType="number-pad"
                maxLength={1}
                ref={(ref) => inputRefs.current[index] = ref}
                selectTextOnFocus
              />
            ))}
          </Animated.View>

          <TouchableOpacity 
            style={[
              styles.button, 
              (otp.join("").length !== 6 || loading) && styles.buttonDisabled
            ]}
            onPress={handleNext}
            disabled={otp.join("").length !== 6 || loading}
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
            <Text style={styles.timerText}>
              Didn't receive the code?{" "}
            </Text>
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
  safeContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardView: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A", // Deep Navy
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 32,
    justifyContent: "center",
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
  subtitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    color: "#0F172A",
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 8,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  emailText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3182CE", // Trust Blue
    marginBottom: 40,
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  otpInput: {
    width: 50,
    height: 56,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
  },
  otpInputFilled: {
    borderColor: "#3182CE",
    backgroundColor: "#ffffff",
    boxShadow: "0px 4px 8px rgba(49, 130, 206, 0.1)",
    elevation: 4,
  },
  otpInputFocused: {
    borderColor: "#3182CE",
    backgroundColor: "#ffffff",
    boxShadow: "0px 4px 8px rgba(49, 130, 206, 0.1)",
    elevation: 4,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F172A", // Deep Navy
    height: 56,
    borderRadius: 16,
    width: "100%",
    marginBottom: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 0,
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 8,
  },
  timerText: {
    fontSize: 14,
    color: "#64748B",
  },
  timerCount: {
    fontSize: 14,
    color: "#3182CE", // Trust Blue
    fontWeight: "600",
  },
  resendText: {
    fontSize: 14,
    color: "#3182CE", // Trust Blue
    fontWeight: "700",
    textDecorationLine: "underline",
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
  highlightText: {
    color: "#0F172A",
    fontWeight: "600",
  },
});