// SafeRouteMap.web.jsx
// Metro automatically uses this file instead of SafeRouteMap.jsx on web,
// preventing the native-only react-native-maps from being bundled for web.
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function SafeRouteMapScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Ionicons name="phone-portrait-outline" size={70} color="#aaa" />
        <Text style={styles.title}>Open on your phone</Text>
        <Text style={styles.subtitle}>
          The Safe Route Map feature uses native maps and is only available on Android & iOS.
          Scan the QR code with Expo Go on your phone to use it.
        </Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={18} color="#fff" />
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    color: "#aaa",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D4105D",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  backBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
