import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  Animated,
  Easing,
  ActivityIndicator,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authAPI } from '../services/api';

const { width } = Dimensions.get('window');

export default function OTPScreen({ navigation, route }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRefs = useRef([]);
  const shakeAnimation = new Animated.Value(0);
  const email = route.params?.email || "";
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
      inputRefs.current[index + 1].focus();
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
      inputRefs.current[index - 1].focus();
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
        const data = await authAPI.verifyOTP(email, enteredOtp);
        console.log('✅ OTP verification response:', data);
        
        // Check if it's a duplicate request message
        if (data.message?.includes('already in progress')) {
          console.log('⚠️ Duplicate request, ignoring...');
          return; // Don't show success for duplicate requests
        }
        
        // Navigate directly without alert for better UX
        console.log('🎉 Navigating to success screen...');
        navigation.navigate('VerificationSuccess', {
          email: email,
          nextScreen: 'TravelProfile' // Can be customized based on user type
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#262626" />
          </TouchableOpacity>
          <Text style={styles.title}>OTP Verification</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={50} color="#D4105D" />
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

          <Animated.View style={[styles.otpContainer, { transform: [{ translateX }] }]}>
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
      </KeyboardAvoidingView>
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  backButton: {
    padding: 8,
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
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFE8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#D4105D",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  subtitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#262626",
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
    lineHeight: 22,
  },
  emailText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D4105D",
    marginBottom: 40,
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: width * 0.8,
    marginBottom: 35,
  },
  otpInput: {
    width: 55,
    height: 55,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    backgroundColor: "#fff",
    color: "#262626",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  otpInputFilled: {
    borderColor: "#D4105D",
    backgroundColor: "#FFE8F0",
    shadowColor: "#D4105D",
    shadowOpacity: 0.1,
  },
  otpInputFocused: {
    borderColor: "#D4105D",
    backgroundColor: "#fff",
    shadowColor: "#D4105D",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D4105D",
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: "100%",
    marginBottom: 25,
    shadowColor: "#D4105D",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  timerText: {
    fontSize: 14,
    color: "#666",
  },
  timerCount: {
    fontSize: 14,
    color: "#D4105D",
    fontWeight: "600",
  },
  resendText: {
    fontSize: 14,
    color: "#D4105D",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
  highlightText: {
    color: "#D4105D",
    fontWeight: "600",
  },
});