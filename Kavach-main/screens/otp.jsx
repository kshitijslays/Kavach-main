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
  Easing
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import VerificationSuccess from "./VerificationSuccess";

export default function OTPScreen({ navigation, route }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const inputRefs = useRef([]);
  const shakeAnimation = new Animated.Value(0);
  const mobileNumber = route.params?.mobileNumber || "+91 XXXXX XXXXX";

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
    
    // Auto submit if last digit is entered
    if (value && index === 5) {
      handleNext();
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace to move to previous input
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleNext = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length === 6) {
      // Mock verification success - navigate to VerificationSuccess
      navigation.navigate("VerificationSuccess", { mobileNumber });
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

  const resendOTP = () => {
    setTimer(30);
    setIsResendDisabled(true);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0].focus();
    Alert.alert("OTP Resent", "A new OTP has been sent to your mobile number");
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
            <Ionicons name="arrow-back" size={24} color="#03474f" />
          </TouchableOpacity>
          <Text style={styles.title}>OTP Verification</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={50} color="#03474f" />
          </View>
          
          <Text style={styles.subtitle}>
            Enter the verification code
          </Text>
          
          <Text style={styles.message}>
            We've sent a 6-digit code to your registered number
          </Text>
          
          <Text style={styles.mobileText}>
            {mobileNumber}
          </Text>

          <Animated.View style={[styles.otpContainer, { transform: [{ translateX }] }]}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                style={[styles.otpInput, digit && styles.otpInputFilled]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                ref={(ref) => inputRefs.current[index] = ref}
                selectTextOnFocus
              />
            ))}
          </Animated.View>

          <TouchableOpacity 
            style={[styles.button, otp.join("").length !== 6 && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={otp.join("").length !== 6}
          >
            <Text style={styles.buttonText}>Verify & Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.timerText}>
              Didn't receive the code? 
            </Text>
            {isResendDisabled ? (
              <Text style={styles.timerText}>
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
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </KeyboardAvoidingView>
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  backButton: {
    padding: 5,
  },
  placeholder: {
    width: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#03474f",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F4FD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
    color: "#03474f",
  },
  message: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 5,
    textAlign: "center",
  },
  mobileText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#03474f",
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 30,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    backgroundColor: "#fff",
  },
  otpInputFilled: {
    borderColor: "#03474f",
    backgroundColor: "#F0F9FF",
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
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "#9aa9b1",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 10,
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerText: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 5,
  },
  resendText: {
    fontSize: 14,
    color: "#03474f",
    fontWeight: "600",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
});