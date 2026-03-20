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
import { useUser } from "../context/UserContext";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
export default function HomeScreen({ navigation, route }) {
  const { user } = useUser();
  const [safetyStatus, setSafetyStatus] = useState("safe"); // safe, danger, offline
  const [location, setLocation] = useState("Fetching location...");
  const [isTracking, setIsTracking] = useState(true);

  // Get user data from context or navigation params
  const userData = user || route.params?.userData || {};
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
      icon: "people"
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
      <StatusBar backgroundColor="#F8FAFC" barStyle="dark-content" />
      
      {/* Sleek Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hello, {userName}</Text>
          <Text style={styles.subGreeting}>Stay safe with Shield</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate("Profile")}
        >
          <View style={styles.avatarPlaceholder}>
             <Ionicons name="person" size={20} color="#0F172A" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Modern Status Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.statusBannerLeft}>
            <View style={[styles.statusIndicator, { backgroundColor: isTracking ? "#10B981" : "#64748B" }]} />
            <Text style={styles.statusBannerText}>{isTracking ? "Live Tracking Active" : "Tracking Paused"}</Text>
          </View>
          <TouchableOpacity 
            style={styles.trackingToggle}
            onPress={() => setIsTracking(!isTracking)}
          >
            <Text style={styles.trackingToggleText}>{isTracking ? "Pause" : "Resume"}</Text>
          </TouchableOpacity>
        </View>

        {/* Primary SOS Action Removed as per user request */}
        <Text style={styles.sectionTitle}>Dashboard</Text>
        <View style={styles.widgetGrid}>
          {quickActions.map((action, i) => (
            <TouchableOpacity
              key={action.id}
              style={styles.widgetCard}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.widgetIconArea, { backgroundColor: i === 0 ? '#EFF6FF' : i === 1 ? '#FEF2F2' : i === 2 ? '#ECFDF5' : '#F8FAFC' }]}>
                <Ionicons 
                  name={action.icon} 
                  size={24} 
                  color={i === 0 ? '#3B82F6' : i === 1 ? '#EF4444' : i === 2 ? '#10B981' : '#64748B'} 
                />
              </View>
              <Text style={styles.widgetTitle}>{action.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Safety Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          {safetyTips.map((tip, i) => (
            <TouchableOpacity key={tip.id} style={styles.tipCard} activeOpacity={0.7}>
              <View style={[styles.tipIcon, { backgroundColor: i === 0 ? '#FEF2F2' : i === 1 ? '#EFF6FF' : '#ECFDF5' }]}>
                <Ionicons name={tip.icon} size={20} color={i === 0 ? '#EF4444' : i === 1 ? '#3B82F6' : '#10B981'} />
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
              {emergencyContacts.slice(0, 2).map((contact, i) => (
                <View key={i} style={styles.contactItem}>
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

        {/* Safe Route Module Card */}
        <View style={styles.safeRouteModule}>
          <View style={styles.moduleHeader}>
             <Ionicons name="map-outline" size={20} color="#0F172A" />
             <Text style={styles.moduleTitle}>Safe Router</Text>
          </View>
          <Text style={styles.moduleDescription}>
            Find the safest path to your destination avoiding high-risk zones.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('SafeRouteMap')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Open Map</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Digital ID Preview */}
        <View style={styles.digitalIdSection}>
          <Text style={styles.sectionTitle}>Your Digital ID</Text>
          <TouchableOpacity 
            style={styles.digitalIdCard}
            onPress={() => navigation.navigate("DigitalID")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#0F172A", "#1E293B"]}
              style={styles.digitalIdGradient}
            >
              <View style={styles.digitalIdHeader}>
                <Ionicons name="id-card" size={24} color="#3B82F6" />
                <Text style={styles.digitalIdTitle}>Shield Digital ID</Text>
              </View>
              <View style={styles.digitalIdContent}>
                <Text style={styles.digitalIdName}>{userData?.name || "Tourist User"}</Text>
                <Text style={styles.digitalIdType}>
                  {route.params?.profile?.title || "Traveler"} Profile
                </Text>
              </View>
              <View style={styles.digitalIdFooter}>
                <Text style={styles.digitalIdText}>Tap to view full ID</Text>
                <Ionicons name="qr-code" size={20} color="#3B82F6" />
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
    backgroundColor: "#F8FAFC", // Clean light slate background
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
  // Clean Minimalist Top Bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 16,
  },
  headerLeft: {
    flexDirection: "column",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },
  subGreeting: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  profileButton: {
    padding: 0,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },

  // Modern Status Banner
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    boxShadow: [{ color: "rgba(0, 0, 0, 0.03)", offsetX: 0, offsetY: 2, blurRadius: 8 }],
    elevation: 2,
  },
  statusBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusBannerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  trackingToggle: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  trackingToggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
  },

  // Massive SOS Button Area
  sosContainer: {
    alignItems: "center",
    marginVertical: 32,
  },
  sosButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    boxShadow: [{ color: "rgba(239, 68, 68, 0.3)", offsetX: 0, offsetY: 8, blurRadius: 16 }],
    elevation: 8,
  },
  sosGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FEE2E2",
  },
  sosText: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    marginTop: 4,
    letterSpacing: 2,
  },
  sosSubtext: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    marginTop: 2,
  },

  // Section Headers
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginHorizontal: 20,
    marginBottom: 16,
  },

  // Dashboard Widget Grid
  widgetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    justifyContent: "space-between",
    marginBottom: 24,
  },
  widgetCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    boxShadow: [{ color: "rgba(0, 0, 0, 0.03)", offsetX: 0, offsetY: 2, blurRadius: 6 }],
    elevation: 2,
  },
  widgetIconArea: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  widgetTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },

  // Generic List Sections (Tips & Contacts)
  tipsSection: {
    marginBottom: 24,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  
  contactsSection: {
    marginBottom: 24,
  },
  contactsPreview: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  contactInitial: {
    color: "#0F172A",
    fontWeight: "bold",
    fontSize: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },
  contactNumber: {
    fontSize: 13,
    color: "#64748B",
  },
  moreContacts: {
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  moreContactsText: {
    color: "#3B82F6",
    fontWeight: "600",
    fontSize: 14,
  },

  // Safe Route Module
  safeRouteModule: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 24,
  },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginLeft: 8,
  },
  moduleDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#0F172A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    marginRight: 8,
  },

  // Digital ID Card
  digitalIdSection: {
    marginBottom: 40,
  },
  digitalIdCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  digitalIdGradient: {
    padding: 24,
    borderRadius: 16,
  },
  digitalIdHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  digitalIdTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  digitalIdContent: {
    marginBottom: 20,
  },
  digitalIdName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  digitalIdType: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  digitalIdFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  digitalIdText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
});