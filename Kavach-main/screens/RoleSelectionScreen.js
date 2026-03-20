import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

export default function RoleSelectionScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
        <View style={[styles.topIllustration, { paddingTop: height * 0.05 }]}>
          {/* Abstract background styling */}
          <View style={[styles.glowCircle, { 
            width: width * 1.5, 
            height: width * 1.5, 
            borderRadius: width * 0.75, 
            top: -width * 0.5 
          }]} />
          
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
          {/* Illustration Section */}
          <View style={[styles.illustrationContainer, { height: height * 0.3 }]}>
            <Image
              source={{ uri: "https://1kga789wdc.ufs.sh/f/lJZn16SaUVX5LyYiqtLV4dQjwtUe75ApxbP68hlkFNKnGZIq" }}
              style={styles.illustration}
              resizeMode="contain"
            />
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
  },
  glowCircle: {
    position: 'absolute',
    backgroundColor: '#1E293B',
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
    boxShadow: [{ color: "rgba(59, 130, 246, 0.4)", offsetX: 0, offsetY: 8, blurRadius: 12 }],
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
    boxShadow: [{ color: "rgba(0, 0, 0, 0.1)", offsetX: 0, offsetY: -10, blurRadius: 20 }],
    elevation: 20,
  },
  illustrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  illustration: {
    width: "100%",
    height: "100%",
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
    boxShadow: [{ color: "rgba(15, 23, 42, 0.25)", offsetX: 0, offsetY: 8, blurRadius: 12 }],
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