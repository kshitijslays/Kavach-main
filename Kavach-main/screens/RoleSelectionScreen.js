import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function RoleSelectionScreen({ navigation }) {
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      navigation.navigate("TouristSignUp");
    }, 200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#262626" />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.topIllustration}>
          {/* Abstract background styling */}
          <View style={styles.glowCircle} />
          
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="shield-checkmark" size={48} color="#fff" />
            </View>
            <Text style={styles.title}>Shield AI</Text>
            <Text style={styles.subtitle}>
              Intelligent protection for your everyday journeys
            </Text>
          </View>
        </View>

        {/* Bottom Sheet Section */}
        <View style={styles.bottomSheet}>
          <Text style={styles.sheetTitle}>Core Features</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureRow}>
              <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="mic" size={20} color="#3B82F6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>AI Listening</Text>
                <Text style={styles.featureDesc}>Detects distress signals</Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="warning" size={20} color="#EF4444" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Automated SOS</Text>
                <Text style={styles.featureDesc}>Hands-free emergency response</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={handleGetStarted}
              activeOpacity={0.9}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{" "}
                <Text
                  style={styles.footerLink}
                  onPress={() => navigation.navigate("Login")}
                >
                  Sign In
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  // Top Half
  topIllustration: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: height * 0.05,
  },
  glowCircle: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: '#1E293B',
    top: -width * 0.5,
    opacity: 0.5,
  },
  header: {
    alignItems: "center",
    zIndex: 10,
  },
  logoContainer: {
    backgroundColor: "#3B82F6",
    width: 90,
    height: 90,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 12,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: "80%",
  },

  // Bottom Sheet Half
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 20,
  },
  featuresList: {
    marginBottom: 32,
    gap: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: "#64748B",
  },
  bottomSection: {
    gap: 24,
  },
  getStartedButton: {
    backgroundColor: "#0F172A",
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  getStartedText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#64748B",
  },
  footerLink: {
    color: "#3B82F6",
    fontWeight: "700",
  },
});