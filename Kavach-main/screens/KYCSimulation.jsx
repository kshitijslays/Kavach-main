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
import TripDetailsScreen from "./TripDetails";

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

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#03474f" />
          </TouchableOpacity>
          <Text style={styles.title}>KYC Verification</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Body */}
        <View style={styles.content}>
          {loading && (
            <>
              <Ionicons name="scan-circle-outline" size={80} color="#03474f" />
              <Text style={styles.scanText}>Scanning your {profile === "international" ? "Passport" : "Aadhaar"}...</Text>
              <ActivityIndicator size="large" color="#03474f" style={{ marginTop: 16 }} />
            </>
          )}

          {success && (
            <>
              <Ionicons name="checkmark-circle" size={80} color="green" />
              <Text style={styles.successText}>KYC Successful!</Text>
              <TouchableOpacity 
                style={styles.primaryBtn}
                onPress={() => navigation.navigate("TripDetails", { profile })}
              >
                <Text style={styles.primaryBtnText}>Continue</Text>
              </TouchableOpacity>
            </>
          )}
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  backButton: {
    padding: 5,
  },
  placeholder: {
    width: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#03474f",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  scanText: {
    fontSize: 16,
    color: "#03474f",
    marginTop: 12,
  },
  successText: {
    fontSize: 20,
    fontWeight: "600",
    color: "green",
    marginTop: 12,
  },
  primaryBtn: {
    marginTop: 20,
    backgroundColor: "#03474f",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
