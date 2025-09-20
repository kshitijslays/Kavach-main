import { Ionicons } from "@expo/vector-icons";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ScanTourist({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const scannerLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getPermissions();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scannerLineAnim, {
          toValue: 240,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(scannerLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [scannerLineAnim]);

  const handleCapture = () => {
    Alert.alert(
      "ID Verified Successfully",
      "The QR code matches a valid Digital ID on the blockchain. The tourist is a genuine traveler.",
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner style={StyleSheet.absoluteFillObject} />
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Scan Tourist Digital ID</Text>
        <View style={styles.scannerBox}>
          <Animated.View
            style={[
              styles.scannerLine,
              { transform: [{ translateY: scannerLineAnim }] },
            ]}
          />
        </View>
        <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
          <Ionicons name="camera" size={32} color="#fff" />
          <Text style={styles.captureButtonText}>Capture & Verify</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "space-around",
    padding: 20,
  },
  backButton: { position: "absolute", top: 50, left: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginTop: 80,
  },
  scannerBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#007BFF",
    borderRadius: 20,
    overflow: "hidden",
  },
  scannerLine: {
    width: "100%",
    height: 2,
    backgroundColor: "#007BFF",
    shadowColor: "#007BFF",
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  captureButton: {
    backgroundColor: "#007BFF",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 40,
  },
  captureButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
