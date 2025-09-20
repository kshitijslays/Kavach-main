import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert,
  Vibration,
  Animated,
  Platform,
  ScrollView 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PanicButtonScreen() {
  const [alertSent, setAlertSent] = useState(false);
  const [location, setLocation] = useState(null);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    // Start pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePanicPress = () => {
    // Vibrate device
    if (Platform.OS === 'android') {
      Vibration.vibrate([0, 500, 200, 500]);
    } else {
      Vibration.vibrate();
    }

    setAlertSent(true);
    Alert.alert(
      "Emergency Alert Sent",
      "Police and emergency contacts have been notified! Help is on the way.",
      [
        { 
          text: "Cancel Alert", 
          style: "cancel",
          onPress: () => handleCancelAlert() 
        },
        { 
          text: "OK", 
          style: "default" 
        }
      ]
    );

    // Simulate sending location data
    setTimeout(() => {
      setLocation({
        latitude: "28.6139° N",
        longitude: "77.2090° E",
        address: "Connaught Place, New Delhi"
      });
    }, 1000);
  };

  const handleCancelAlert = () => {
    Alert.alert(
      "Cancel Alert",
      "Are you sure you want to cancel the emergency alert?",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => {
            setAlertSent(false);
            setLocation(null);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Emergency Panic Button</Text>
            <Text style={styles.subtitle}>
              Press in case of emergency to alert authorities
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Animated.View style={[
              styles.pulseCircle,
              { transform: [{ scale: pulseAnim }] }
            ]} />
            
            <TouchableOpacity 
              style={[
                styles.panicButton,
                alertSent && styles.panicButtonActive
              ]} 
              onPress={handlePanicPress}
            >
              <Ionicons 
                name={alertSent ? "alert-circle" : "alert-circle-outline"} 
                size={80} 
                color="#fff" 
              />
              <Text style={styles.buttonText}>
                {alertSent ? "ALERT ACTIVE" : "PANIC"}
              </Text>
            </TouchableOpacity>
          </View>

          {alertSent && (
            <View style={styles.alertContainer}>
              <Text style={styles.alertText}>
                Emergency alert is active! Help is on the way.
              </Text>
              {location && (
                <View style={styles.locationContainer}>
                  <Text style={styles.locationTitle}>Your Current Location:</Text>
                  <Text style={styles.locationText}>
                    {location.address}
                  </Text>
                  <Text style={styles.coordsText}>
                    {`${location.latitude}, ${location.longitude}`}
                  </Text>
                </View>
              )}
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancelAlert}
              >
                <Text style={styles.cancelButtonText}>Cancel Alert</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>Emergency Contacts:</Text>
            {EMERGENCY_CONTACTS.map((contact, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.contactItem}
              >
                <Ionicons name={contact.icon} size={24} color="#03474f" />
                <View style={styles.contactText}>
                  <Text style={styles.contactTitle}>{contact.title}</Text>
                  <Text style={styles.contactNumber}>{contact.number}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const EMERGENCY_CONTACTS = [
  { title: "Police", number: "100", icon: "shield-checkmark" },
  { title: "Ambulance", number: "102", icon: "medical" },
  { title: "Women's Helpline", number: "1091", icon: "woman" },
];

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#03474f",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  buttonContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  pulseCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 0, 0, 0.2)",
  },
  panicButton: {
    backgroundColor: "#ff3b30",
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  panicButtonActive: {
    backgroundColor: "#dc2626",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 10,
  },
  alertContainer: {
    backgroundColor: "#fee2e2",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  alertText: {
    fontSize: 16,
    color: "#dc2626",
    fontWeight: "600",
    textAlign: "center",
  },
  locationContainer: {
    marginTop: 12,
    alignItems: "center",
  },
  locationTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    color: "#03474f",
    fontWeight: "600",
  },
  coordsText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  cancelButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  cancelButtonText: {
    color: "#dc2626",
    fontWeight: "600",
    textAlign: "center",
  },
  helpContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#03474f",
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  contactText: {
    marginLeft: 12,
  },
  contactTitle: {
    fontSize: 16,
    color: "#03474f",
    fontWeight: "500",
  },
  contactNumber: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
});