import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";

export default function DigitalIDScreen({ navigation, route }) {
  const profile = route.params?.profile;
  const userData = route.params?.userData;
  
  const touristName = userData?.name || "Tourist User";
  const phoneNumber = userData?.phone || "Not provided";
  const emergencyContacts = userData?.emergencyContacts || [];
  const profileType = profile?.title || "Traveler";
  const digitalId = `TID-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 100000)}`;

  const getProfileIcon = () => {
    switch(profile) {
      case "solo": return "person";
      case "family": return "people";
      case "international": return "airplane";
      default: return "person";
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#262626" />
          </TouchableOpacity>
          <Text style={styles.title}>Digital ID</Text>
          <View style={styles.placeholder} />
        </View>

        <Text style={styles.subtitle}>
          Your secure digital identification is ready
        </Text>

        {/* Digital ID Card */}
        <View style={styles.card}>
          {/* Header Section */}
          <View style={styles.cardHeader}>
            <View style={styles.profileIconContainer}>
              <Ionicons name={getProfileIcon()} size={24} color="#D4105D" />
            </View>
            <Text style={styles.cardTitle}>Kavach Digital ID</Text>
          </View>

          {/* User Info Section */}
          <View style={styles.userSection}>
            <Image
              source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.name}>{touristName}</Text>
              <Text style={styles.profile}>{profileType} Profile</Text>
            </View>
          </View>

          {/* ID Number */}
          <View style={styles.idSection}>
            <Ionicons name="id-card" size={16} color="#D4105D" />
            <Text style={styles.idNumber}>ID: {digitalId}</Text>
          </View>

          {/* Contact Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="call" size={16} color="#666" />
              <Text style={styles.infoText}>{phoneNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="people" size={16} color="#666" />
              <Text style={styles.infoText}>
                {emergencyContacts.length} Emergency Contact{emergencyContacts.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          {/* QR Code Section */}
          <View style={styles.qrSection}>
            <View style={styles.qrContainer}>
              <QRCode 
                value={JSON.stringify({
                  id: digitalId,
                  name: touristName,
                  profile: profileType,
                  phone: phoneNumber
                })} 
                size={140}
                color="#262626"
                backgroundColor="#FFE8F0"
              />
            </View>
            <Text style={styles.qrText}>Scan for verification</Text>
          </View>

          {/* Security Badge */}
          <View style={styles.securitySection}>
            <Ionicons name="shield-checkmark" size={14} color="#27AE60" />
            <Text style={styles.securityText}>Verified & Secure</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              console.log('🏁 Setup completed! Navigating to Home');
              navigation.navigate("Home", {
                setupCompleted: true,
                profile: route.params?.profile,
                userData: route.params?.userData
              });
            }}
            activeOpacity={0.9}
          >
            <Ionicons name="home" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Go to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              // Share functionality can be added here
              console.log('📤 Share Digital ID');
            }}
          >
            <Ionicons name="share" size={20} color="#D4105D" />
            <Text style={styles.secondaryButtonText}>Share ID</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          Keep this ID accessible during your travels for quick verification
        </Text>
      </View>
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
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#262626",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFE8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#262626",
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    borderWidth: 3,
    borderColor: "#FFE8F0",
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 4,
  },
  profile: {
    fontSize: 16,
    color: "#D4105D",
    fontWeight: "600",
  },
  idSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE8F0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  idNumber: {
    fontSize: 14,
    color: "#262626",
    fontWeight: "600",
    marginLeft: 8,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  qrSection: {
    alignItems: "center",
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#FFE8F0",
    borderRadius: 16,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: "#fff",
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
  },
  qrText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  securitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#f0f9f0",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27AE60",
  },
  securityText: {
    fontSize: 14,
    color: "#27AE60",
    fontWeight: "600",
    marginLeft: 6,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D4105D",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#D4105D",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D4105D",
  },
  secondaryButtonText: {
    color: "#D4105D",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  footerNote: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    fontStyle: "italic",
  },
});