import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/4476/4476952.png",
              }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Kavach AI</Text>
          <Text style={styles.subtitle}>
            AI-powered safety that protects you proactively
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.cardsContainer}>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="mic" size={24} color="#d4105d" />
            </View>
            <Text style={styles.cardTitle}>AI Listening</Text>
            <Text style={styles.cardDesc}>
              Detects distress signals instantly
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="camera" size={24} color="#d4105d" />
            </View>
            <Text style={styles.cardTitle}>Motion Detection</Text>
            <Text style={styles.cardDesc}>
              Tracks suspicious movements
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="hand-left" size={24} color="#d4105d" />
            </View>
            <Text style={styles.cardTitle}>Hands-free SOS</Text>
            <Text style={styles.cardDesc}>
              Automatic emergency response
            </Text>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Get Started Button */}
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.9}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>

          {/* Footer */}
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
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#262626",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: height * 0.05,
    paddingBottom: 30,
  },
  header: {
    alignItems: "center",
  },
  logoContainer: {
    backgroundColor: "#fff",
    width: 85,
    height: 85,
    borderRadius: 42.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#d4105d",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 50,
    height: 50,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    maxWidth: "85%",
    lineHeight: 19,
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    width: "31%",
    backgroundColor: "#333",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#444",
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(212, 16, 93, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginBottom: 5,
  },
  cardDesc: {
    fontSize: 10.5,
    color: "#999",
    textAlign: "center",
    lineHeight: 14,
  },
  bottomSection: {
    gap: 20,
  },
  getStartedButton: {
    backgroundColor: "#d4105d",
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#d4105d",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  getStartedText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginRight: 8,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#999",
  },
  footerLink: {
    color: "#d4105d",
    fontWeight: "600",
  },
});