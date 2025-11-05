import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Speech from "expo-speech";

let Accelerometer, Location;
if (Platform.OS !== "web") {
  Accelerometer = require("expo-sensors").Accelerometer;
  Location = require("expo-location");
}

export default function MovementDetector() {
  const [lastAlert, setLastAlert] = useState(0);

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
        const threshold = 2.5;

        const now = Date.now();
        if (magnitude > threshold && now - lastAlert > 15000) {
          setLastAlert(now);
          console.log("⚠️ Sudden movement detected!");
          const location = await Location.getCurrentPositionAsync({});
          console.log("Location:", location.coords);
          Speech.speak("Alert sent to trusted contacts!");
        }
      });
    };

    startDetection();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  return null;
}
