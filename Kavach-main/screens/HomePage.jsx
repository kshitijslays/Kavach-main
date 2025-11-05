import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen({ navigation, route }) {
  const [safetyStatus, setSafetyStatus] = useState("safe"); // safe, danger, offline
  const [location, setLocation] = useState("Fetching location...");
  const [isTracking, setIsTracking] = useState(true);

  // Get user data from navigation params
  const userData = route.params?.userData || {};
  const userName = userData?.name?.split(' ')[0] || "Traveler";
  const emergencyContacts = userData?.emergencyContacts || [];

  useEffect(() => {
    // Simulate location fetching
    const timer = setTimeout(() => {
      setLocation("Connaught Place, New Delhi");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const quickActions = [
    {
      id: "1",
      name: "Share Live Location",
      icon: "location",
      color: "#D4105D",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert("Share Location", "Live location sharing activated for 1 hour");
      }
    },
    {
      id: "2",
      name: "Call Emergency",
      icon: "call",
      color: "#D4105D",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert("Emergency Call", "Calling primary emergency contact...");
      }
    },
    {
      id: "3",
      name: "Nearest Safe Place",
      icon: "navigate",
      color: "#D4105D",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        navigation.navigate("SafePlaces");
      }
    },
    {
      id: "4",
      name: "Safety Mode",
      icon: "shield",
      color: "#D4105D",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsTracking(!isTracking);
        Alert.alert(
          isTracking ? "Safety Mode Paused" : "Safety Mode Active",
          isTracking 
            ? "Background tracking and monitoring paused"
            : "Background tracking and monitoring activated"
        );
      }
    }
  ];

  const safetyTips = [
    {
      id: "1",
      title: "Stay Alert in Crowds",
      description: "Keep your belongings secure and be aware of your surroundings in crowded areas.",
      icon: "people"
    },
    {
      id: "2",
      title: "Emergency Contacts Ready",
      description: `You have ${emergencyContacts.length} emergency contact${emergencyContacts.length !== 1 ? 's' : ''} set up.`,
      icon: "contacts"
    },
    {
      id: "3",
      title: "Share Your Itinerary",
      description: "Let someone know your travel plans and expected return time.",
      icon: "calendar"
    }
  ];

  const getStatusIcon = () => {
    switch(safetyStatus) {
      case "safe": return { icon: "checkmark-circle", color: "#27AE60", text: "You're Safe" };
      case "danger": return { icon: "warning", color: "#FF3B30", text: "Emergency Mode" };
      case "offline": return { icon: "cloud-offline", color: "#666", text: "Offline Mode" };
      default: return { icon: "checkmark-circle", color: "#27AE60", text: "You're Safe" };
    }
  };

  const status = getStatusIcon();

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor="#D4105D" barStyle="light-content" />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.logoContainer}>
          <Ionicons name="shield" size={24} color="#fff" />
          <Text style={styles.logoText}>Kavach</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name="person-circle" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Greeting & Safety Status */}
        <View style={styles.statusCard}>
          <LinearGradient
            colors={["#D4105D", "#B80D52"]}
            style={styles.statusGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.greetingSection}>
              <View>
                <Text style={styles.greeting}>Hi, {userName} 👋</Text>
                <Text style={styles.statusText}>{status.text}</Text>
              </View>
              <Ionicons name={status.icon} size={32} color={status.color} />
            </View>
            
            <View style={styles.locationSection}>
              <Ionicons name="location" size={16} color="#fff" />
              <Text style={styles.locationText}>{location}</Text>
              <View style={[
                styles.trackingIndicator,
                { backgroundColor: isTracking ? "#27AE60" : "#666" }
              ]}>
                <Text style={styles.trackingText}>
                  {isTracking ? "LIVE" : "PAUSED"}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickAction}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon} size={24} color="#fff" />
                </View>
                <Text style={styles.actionText}>{action.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Safety Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          {safetyTips.map((tip) => (
            <TouchableOpacity key={tip.id} style={styles.tipCard} activeOpacity={0.7}>
              <View style={styles.tipIcon}>
                <Ionicons name={tip.icon} size={20} color="#D4105D" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency Contacts Preview */}
        {emergencyContacts.length > 0 && (
          <View style={styles.contactsSection}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <View style={styles.contactsPreview}>
              {emergencyContacts.slice(0, 2).map((contact, index) => (
                <View key={index} style={styles.contactItem}>
                  <View style={styles.contactAvatar}>
                    <Text style={styles.contactInitial}>
                      {contact.name?.charAt(0)?.toUpperCase() || "C"}
                    </Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactNumber}>{contact.number}</Text>
                  </View>
                </View>
              ))}
              {emergencyContacts.length > 2 && (
                <TouchableOpacity 
                  style={styles.moreContacts}
                  onPress={() => navigation.navigate("EmergencyContacts")}
                >
                  <Text style={styles.moreContactsText}>
                    +{emergencyContacts.length - 2} more
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Digital ID Preview */}
        <View style={styles.digitalIdSection}>
          <Text style={styles.sectionTitle}>Your Digital ID</Text>
          <TouchableOpacity 
            style={styles.digitalIdCard}
            onPress={() => navigation.navigate("DigitalID")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#FFE8F0", "#fff"]}
              style={styles.digitalIdGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.digitalIdHeader}>
                <Ionicons name="id-card" size={24} color="#D4105D" />
                <Text style={styles.digitalIdTitle}>Kavach Digital ID</Text>
              </View>
              <View style={styles.digitalIdContent}>
                <Text style={styles.digitalIdName}>{userData?.name || "Tourist User"}</Text>
                <Text style={styles.digitalIdType}>
                  {route.params?.profile?.title || "Traveler"} Profile
                </Text>
              </View>
              <View style={styles.digitalIdFooter}>
                <Text style={styles.digitalIdText}>Tap to view full ID</Text>
                <Ionicons name="qr-code" size={20} color="#D4105D" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  scrollContent: {
    paddingBottom: 30,
  },
  // Top Bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#D4105D",
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 12,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
  },
  profileButton: {
    padding: 4,
  },
  // Status Card
  statusCard: {
    margin: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  statusGradient: {
    padding: 20,
  },
  greetingSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  statusText: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
  },
  locationSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    color: "#fff",
    marginLeft: 6,
    marginRight: 12,
    fontSize: 14,
    flex: 1,
  },
  trackingIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trackingText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  // Quick Actions
  quickActionsSection: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAction: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 6,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 12,
    color: "#262626",
    fontWeight: "500",
    textAlign: "center",
  },
  // Safety Tips
  tipsSection: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFE8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#262626",
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
  },
  // Contacts Section
  contactsSection: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  contactsPreview: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D4105D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactInitial: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#262626",
    marginBottom: 2,
  },
  contactNumber: {
    fontSize: 14,
    color: "#666",
  },
  moreContacts: {
    alignItems: "center",
    paddingVertical: 8,
  },
  moreContactsText: {
    color: "#D4105D",
    fontWeight: "600",
    fontSize: 14,
  },
  // Digital ID Section
  digitalIdSection: {
    marginHorizontal: 20,
  },
  digitalIdCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  digitalIdGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: "#FFE8F0",
  },
  digitalIdHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  digitalIdTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#262626",
    marginLeft: 10,
  },
  digitalIdContent: {
    marginBottom: 15,
  },
  digitalIdName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 4,
  },
  digitalIdType: {
    fontSize: 16,
    color: "#D4105D",
    fontWeight: "600",
  },
  digitalIdFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  digitalIdText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});