import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function RoleSelectionScreen({ navigation }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRoleSelect = (role) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRole(role);

    // Navigate after a brief delay to show selection feedback
    setTimeout(() => {
      if (role === "tourist") {
        navigation.navigate("TouristSignUp");
      } else {
        navigation.navigate("AuthorityLogin");
      }
    }, 300);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Background decorative elements */}
      <View style={styles.backgroundCircle1} />
      <View style={styles.backgroundCircle2} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Logo and Welcome Section */}
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
            <Text style={styles.title}>Welcome to Kavach</Text>
            <Text style={styles.subtitle}>
              Your safety is our priority. Choose your role to continue your
              journey
            </Text>
          </View>

          {/* Role Selection Cards */}
          <View style={styles.cardsContainer}>
            <Animated.View
              style={[
                styles.cardWrapper,
                selectedRole === "tourist" && styles.selectedCardWrapper,
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.card,
                  styles.touristCard,
                  selectedRole === "tourist" && styles.cardSelected,
                ]}
                onPress={() => handleRoleSelect("tourist")}
                activeOpacity={0.9}
              >
                <View style={styles.cardIconContainer}>
                  <View style={[styles.iconBackground, styles.touristIconBg]}>
                    <Ionicons name="person" size={28} color="#4CAF50" />
                  </View>
                </View>
                <Text style={styles.cardTitle}>Tourist</Text>
                <Text style={styles.cardDescription}>
                  Explore destinations with safety features, emergency
                  assistance, and real-time alerts
                </Text>

                <View style={styles.featuresList}>
                  <View style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#4CAF50"
                    />
                    <Text style={styles.featureText}>Emergency SOS</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#4CAF50"
                    />
                    <Text style={styles.featureText}>Safety Alerts</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#4CAF50"
                    />
                    <Text style={styles.featureText}>Travel Guides</Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.cardButton,
                    selectedRole === "tourist" && styles.cardButtonSelected,
                  ]}
                >
                  <Text style={styles.cardButtonText}>Continue as Tourist</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={[
                styles.cardWrapper,
                selectedRole === "authority" && styles.selectedCardWrapper,
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.card,
                  styles.authorityCard,
                  selectedRole === "authority" && styles.cardSelected,
                ]}
                onPress={() => handleRoleSelect("authority")}
                activeOpacity={0.9}
              >
                <View style={styles.cardIconContainer}>
                  <View style={[styles.iconBackground, styles.authorityIconBg]}>
                    <MaterialCommunityIcons
                      name="shield-account"
                      size={28}
                      color="#2196F3"
                    />
                  </View>
                </View>
                <Text style={styles.cardTitle}>Authority</Text>
                <Text style={styles.cardDescription}>
                  Monitor tourist safety, respond to emergency alerts, and
                  manage crisis situations
                </Text>

                <View style={styles.featuresList}>
                  <View style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#2196F3"
                    />
                    <Text style={styles.featureText}>Alert Management</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#2196F3"
                    />
                    <Text style={styles.featureText}>Tourist Tracking</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#2196F3"
                    />
                    <Text style={styles.featureText}>Emergency Response</Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.cardButton,
                    selectedRole === "authority" && styles.cardButtonSelected,
                  ]}
                >
                  <Text style={styles.cardButtonText}>
                    Continue as Authority
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* App Features Highlights */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>
              Why Choose Surakshit Yatra?
            </Text>
            <View style={styles.featuresGrid}>
              <View style={styles.featureHighlight}>
                <View style={[styles.featureIconContainer, styles.safetyIcon]}>
                  <Ionicons name="shield-checkmark" size={24} color="#03474f" />
                </View>
                <Text style={styles.featureHighlightText}>Enhanced Safety</Text>
              </View>
              <View style={styles.featureHighlight}>
                <View
                  style={[styles.featureIconContainer, styles.realtimeIcon]}
                >
                  <Ionicons name="notifications" size={24} color="#03474f" />
                </View>
                <Text style={styles.featureHighlightText}>
                  Real-time Alerts
                </Text>
              </View>
              <View style={styles.featureHighlight}>
                <View style={[styles.featureIconContainer, styles.supportIcon]}>
                  <Ionicons name="help-buoy" size={24} color="#03474f" />
                </View>
                <Text style={styles.featureHighlightText}>24/7 Support</Text>
              </View>
            </View>
          </View>

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
            <Text style={styles.footerCopyright}>
              © 2025 Kavach. All rights reserved.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
    zIndex: 1,
  },
  backgroundCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(3, 71, 79, 0.03)",
    top: -100,
    right: -100,
  },
  backgroundCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(76, 175, 80, 0.05)",
    bottom: -50,
    left: -50,
  },
  header: {
    alignItems: "center",
    marginTop: height * 0.02,
    marginBottom: 30,
  },
  logoContainer: {
    backgroundColor: "#fff",
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: 70,
    height: 70,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#03474f",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
    maxWidth: "90%",
  },
  cardsContainer: {
    marginBottom: 30,
  },
  cardWrapper: {
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    transform: [{ scale: 1 }],
    transition: "transform 0.3s ease",
  },
  selectedCardWrapper: {
    transform: [{ scale: 1.02 }],
    shadowColor: "#03474f",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    overflow: "hidden",
  },
  touristCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#4CAF50",
  },
  authorityCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#2196F3",
  },
  cardSelected: {
    backgroundColor: "#f8ffff",
  },
  cardIconContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  iconBackground: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  touristIconBg: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  authorityIconBg: {
    backgroundColor: "rgba(33, 150, 243, 0.1)",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#03474f",
  },
  cardDescription: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#555",
  },
  cardButton: {
    backgroundColor: "#03474f",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  cardButtonSelected: {
    backgroundColor: "#4CAF50",
  },
  cardButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  featuresSection: {
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#03474f",
    textAlign: "center",
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  featureHighlight: {
    width: "30%",
    alignItems: "center",
    marginBottom: 15,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  safetyIcon: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  realtimeIcon: {
    backgroundColor: "rgba(33, 150, 243, 0.1)",
  },
  supportIcon: {
    backgroundColor: "rgba(255, 152, 0, 0.1)",
  },
  featureHighlightText: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  footerLink: {
    color: "#03474f",
    fontWeight: "600",
  },
  footerCopyright: {
    fontSize: 12,
    color: "#999",
  },
});

// Responsive adjustments
if (width > 500) {
  styles.cardsContainer.flexDirection = "row";
  styles.cardsContainer.justifyContent = "space-between";
  styles.cardWrapper.width = width * 0.45;
  styles.card.width = "100%";
  styles.featuresGrid.justifyContent = "center";
  styles.featureHighlight.width = "28%";
}
