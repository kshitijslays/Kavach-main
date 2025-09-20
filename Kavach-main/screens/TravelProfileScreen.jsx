import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function TravelProfileScreen({ navigation }) {
  const [selectedId, setSelectedId] = useState(null);
  const scaleAnim = new Animated.Value(1);

  const profiles = [
    {
      id: "solo",
      title: "Traveling Solo",
      icon: "person-outline",
      description: "Perfect for independent travelers",
      // Add a screen property to specify which component to navigate to
      screen: "KycSimulation",
    },
    {
      id: "family",
      title: "Traveling with Family",
      icon: "people-outline",
      description: "Safety features for group travel",
      screen: "KYC", // Default KYC screen for other options
    },
    {
      id: "international",
      title: "International Tourist",
      icon: "airplane-outline",
      description: "Special assistance for foreign visitors",
      screen: "KYC", // Default KYC screen for other options
    },
  ];

  const handleSelect = (profile) => {
    setSelectedId(profile.id);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate to the screen specified in the profile object
      navigation.navigate(profile.screen, { profile });
    });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#03474f" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Travel Profile</Text>
            <Text style={styles.subtitle}>Select your travel type</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Enhanced Cards */}
        <View style={styles.content}>
          {profiles.map((profile) => (
            <Animated.View
              key={profile.id}
              style={[
                styles.cardContainer,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.card,
                  selectedId === profile.id && styles.selectedCard,
                ]}
                onPress={() => handleSelect(profile)}
                activeOpacity={0.7}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name={profile.icon} size={32} color="#03474f" />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{profile.title}</Text>
                  <Text style={styles.cardDescription}>
                    {profile.description}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color="#03474f"
                  style={styles.cardArrow}
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Footer Help Text */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your travel profile helps us customize your safety features
          </Text>
        </View>
      </View>
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
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#03474f",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
  },
  cardContainer: {
    width: width - 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderColor: "#03474f",
    backgroundColor: "#F0F9FF",
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#03474f",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
  },
  cardArrow: {
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});