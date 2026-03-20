import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ActivityIndicator 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function KycScreen({ route, navigation }) {
  const { profile } = route.params || {}; // solo / family / international
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Simulate scan process
    const timer = setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2500); // 2.5 seconds "scanning"
    return () => clearTimeout(timer);
  }, []);

  const getDocumentType = () => {
    return profile === "international" ? "Passport" : "Aadhaar";
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
          <Text style={styles.title}>KYC Verification</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Body */}
        <View style={styles.content}>
          {loading && (
            <View style={styles.loadingContainer}>
              <View style={styles.scanIconContainer}>
                <Ionicons name="scan-circle-outline" size={100} color="#D4105D" />
              </View>
              <Text style={styles.scanTitle}>Scanning your {getDocumentType()}</Text>
              <Text style={styles.scanDescription}>
                Please hold still while we verify your document
              </Text>
              <ActivityIndicator size="large" color="#D4105D" style={styles.loader} />
              <Text style={styles.securityText}>
                <Ionicons name="shield-checkmark" size={14} color="#27AE60" />
                {" "}Your data is secure and encrypted
              </Text>
            </View>
          )}

          {success && (
            <View style={styles.successContainer}>
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={100} color="#D4105D" />
              </View>
              <Text style={styles.successTitle}>KYC Verified Successfully!</Text>
              <Text style={styles.successDescription}>
                Your {getDocumentType().toLowerCase()} has been verified and you're ready to proceed
              </Text>
              <TouchableOpacity 
                style={styles.primaryBtn}
                onPress={() => {
                  console.log('✅ KYC completed, navigating to TripDetails');
                  navigation.navigate("TripDetails", { 
                    profile,
                    kycCompleted: true,
                    selectedProfile: route.params?.selectedProfile
                  });
                }}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryBtnText}>Continue to Trip Details</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
              </TouchableOpacity>
            </View>
          )}
        </View>
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
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    boxShadow: [{ color: "rgba(0, 0, 0, 0.1)", offsetX: 0, offsetY: 1, blurRadius: 2 }],
    elevation: 2,
  },
  placeholder: {
    width: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#262626",
    textAlign: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  scanIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFE8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    boxShadow: [{ color: "rgba(212, 16, 93, 0.2)", offsetX: 0, offsetY: 4, blurRadius: 8 }],
    elevation: 5,
  },
  scanTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 8,
    textAlign: "center",
  },
  scanDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  loader: {
    marginBottom: 20,
  },
  securityText: {
    fontSize: 14,
    color: "#27AE60",
    fontWeight: "500",
    textAlign: "center",
  },
  successContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  successIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFE8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    boxShadow: [{ color: "rgba(212, 16, 93, 0.2)", offsetX: 0, offsetY: 6, blurRadius: 12 }],
    elevation: 8,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 12,
    textAlign: "center",
  },
  successDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 35,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D4105D",
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    width: "100%",
    boxShadow: [{ color: "rgba(212, 16, 93, 0.3)", offsetX: 0, offsetY: 4, blurRadius: 8 }],
    elevation: 6,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});