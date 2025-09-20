import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function DigitalIDScreen({ navigation }) {
  const touristName = "John Doe"; // Replace with dynamic name
  const profileType = "International Tourist"; // Replace with actual selected profile
  const digitalId = "TID-20250908-12345"; // Mock Digital ID number

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Your Digital ID</Text>

        <View style={styles.card}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{touristName}</Text>
          <Text style={styles.profile}>{profileType}</Text>
          <Text style={styles.idNumber}>ID: {digitalId}</Text>

          <View style={styles.qrContainer}>
            <QRCode value={digitalId} size={150} />
          </View>
        </View>

       // ...existing code...

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("HomePage")} // Changed from HomePage component to string "HomePage"
        >
          <Text style={styles.buttonText}>Go to Home Page</Text>
        </TouchableOpacity>

// ...existing code...
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
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#03474f",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    width: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#03474f",
  },
  profile: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  idNumber: {
    fontSize: 14,
    color: "#03474f",
    marginBottom: 20,
  },
  qrContainer: {
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#03474f",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    width: "80%",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
