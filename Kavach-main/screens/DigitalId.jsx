import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";

export default function DigitalIDScreen({ navigation, route }) {
  const profile = route.params?.profile;
  const userData = route.params?.userData;
  
  const touristName = userData?.name || "Tourist User";
  const phoneNumber = userData?.phone || "Not provided";
  const emergencyContacts = userData?.emergencyContacts || [];
  const profileType = profile?.title || "Traveler";
  const digitalId = `SID-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 100000)}`;

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
      {/* Fixed Header */}
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

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.subtitle}>
          Your secure digital identification is ready
        </Text>

        {/* Digital ID Pass (Apple Wallet Style) */}
        <View style={styles.walletPass}>
          {/* Top Half: Dark Navy Header */}
          <View style={styles.passHeader}>
            <View style={styles.passHeaderTopRow}>
              <View style={styles.profileIconContainer}>
                <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.passTitle}>Shield Digital ID</Text>
            </View>

            <View style={styles.userSection}>
              <View style={styles.userInfo}>
                <Text style={styles.name}>{touristName}</Text>
                <Text style={styles.profileBadge}>{profileType} Profile</Text>
              </View>
              <Image
                source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
                style={styles.avatar}
              />
            </View>
          </View>

          {/* Bottom Half: Bright Content & QR */}
          <View style={styles.passBody}>
            {/* ID Number */}
            <View style={styles.idBadge}>
              <Ionicons name="finger-print" size={16} color="#64748B" />
              <Text style={styles.idNumber}>{digitalId}</Text>
            </View>

            {/* Contact Info Row */}
            <View style={styles.infoGrid}>
              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>PHONE</Text>
                <Text style={styles.infoValue}>{phoneNumber}</Text>
              </View>
              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>CONTACTS</Text>
                <Text style={styles.infoValue}>{emergencyContacts.length} Emergency</Text>
              </View>
            </View>

            {/* QR Code Prominent Display */}
            <View style={styles.qrSection}>
              <View style={styles.qrContainer}>
                <QRCode 
                  value={JSON.stringify({
                    id: digitalId,
                    name: touristName,
                    profile: profileType,
                    phone: phoneNumber
                  })} 
                  size={160}
                  color="#0F172A"
                  backgroundColor="#fff"
                />
              </View>
              <Text style={styles.qrText}>Scan to Verify Identity</Text>
            </View>

            {/* Security Footer */}
            <View style={styles.securitySection}>
              <Ionicons name="checkmark-done-circle" size={16} color="#10B981" />
              <Text style={styles.securityText}>Verified Member</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              navigation.navigate("MainTabs", {
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
              console.log('📤 Share Digital ID');
            }}
          >
            <Ionicons name="share-outline" size={20} color="#0F172A" />
            <Text style={styles.secondaryButtonText}>Share ID</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          Keep this ID accessible during your travels for quick verification
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  backButton: {
    padding: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },

  // Wallet Pass Layout
  walletPass: {
    width: "100%",
    borderRadius: 24,
    backgroundColor: "#fff",
    boxShadow: "0px 16px 32px rgba(15, 23, 42, 0.1)",
    elevation: 12,
    marginBottom: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  passHeader: {
    backgroundColor: "#0F172A",
    padding: 24,
    paddingBottom: 32,
  },
  passHeaderTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  profileIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  passTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  userSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
  },
  profileBadge: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "600",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#3B82F6",
  },

  // Pass Body
  passBody: {
    padding: 24,
    backgroundColor: "#fff",
  },
  idBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 24,
    marginTop: -12, // Pull up slightly
  },
  idNumber: {
    fontSize: 15,
    color: "#475569",
    fontWeight: "700",
    marginLeft: 8,
    letterSpacing: 1,
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  infoBlock: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "600",
  },
  
  qrSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
    elevation: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  qrText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  securitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  securityText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "700",
    marginLeft: 6,
  },

  // Actions Container
  actionsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F172A",
    paddingVertical: 16,
    borderRadius: 16,
    boxShadow: "0px 6px 10px rgba(15, 23, 42, 0.2)",
    elevation: 6,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  secondaryButtonText: {
    color: "#0F172A",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  footerNote: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 20,
  },
});