import React, { useEffect, useState } from "react";
import { Platform, Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Speech from "expo-speech";

let Accelerometer, Location;
if (Platform.OS !== "web") {
  Accelerometer = require("expo-sensors").Accelerometer;
  Location = require("expo-location");
}

export default function MovementDetector() {
  const [lastAlert, setLastAlert] = useState(0);
  const [isAlerting, setIsAlerting] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Handle countdown timer
  useEffect(() => {
    let timer;
    if (isAlerting && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (isAlerting && countdown === 0) {
      // Time is up -> Trigger Emergency
      triggerEmergency();
    }
    return () => clearTimeout(timer);
  }, [isAlerting, countdown]);

  const triggerEmergency = async () => {
    setIsAlerting(false);
    console.log("🚨 Emergency Alert Triggered!");
    try {
      Speech.speak("Alert sent to trusted contacts!");
      const location = await Location.getCurrentPositionAsync({});
      console.log("Emergency Location Sent:", location.coords);
    } catch(err) {
      console.error(err);
    }
  };

  const handleImSafe = () => {
    setIsAlerting(false);
    Speech.speak("Safety confirmed. Emergency cancelled.");
  };

  const handleNeedHelp = () => {
    setIsAlerting(false);
    triggerEmergency();
  };

  // Listen to accelerometer
  useEffect(() => {
    if (Platform.OS === "web") {
      console.log("Movement detection disabled on web.");
      return;
    }

    let subscription;

    const startDetection = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
      }

      Accelerometer.setUpdateInterval(500);

      subscription = Accelerometer.addListener(async (acc) => {
        const { x, y, z } = acc;
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const threshold = 3.5; // Slightly higher to avoid accidental drops triggering it instantly

        const now = Date.now();
        // Trigger if powerful shake and hasn't alerted in the last 45s, and currently not alerting
        if (magnitude > threshold && now - lastAlert > 45000 && !isAlerting) {
          setLastAlert(now);
          setCountdown(30);
          setIsAlerting(true);
          Speech.speak("Sudden movement detected. Are you safe? You have 30 seconds to respond.");
        }
      });
    };

    startDetection();

    return () => {
      if (subscription) subscription.remove();
    };
  }, [lastAlert, isAlerting]);

  if (!isAlerting) return null;

  return (
    <Modal visible={isAlerting} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <Text style={styles.title}>Are you safe?</Text>
          <Text style={styles.subtitle}>
            Sudden movement was detected. If you do not respond, your emergency contacts will be alerted.
          </Text>
          
          <Text style={styles.countdown}>{countdown}</Text>
          <Text style={styles.secText}>seconds remaining</Text>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.safeBtn} onPress={handleImSafe}>
              <Text style={styles.btnText}>YES, I AM SAFE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.helpBtn} onPress={handleNeedHelp}>
              <Text style={styles.btnText}>NO, I NEED HELP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  alertBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#E74C3C",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#444",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  countdown: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#262626",
  },
  secText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
  btnRow: {
    width: "100%",
    gap: 16,
  },
  safeBtn: {
    backgroundColor: "#27AE60",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  helpBtn: {
    backgroundColor: "#E74C3C",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
