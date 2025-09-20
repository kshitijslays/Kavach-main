import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList,
  StyleSheet,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from 'react-native-qrcode-svg';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';

// ...existing mockBlockchainData...

export default function PoliceVerificationDashboard() {
  const navigation = useNavigation();
  const [tourists, setTourists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTourist, setSelectedTourist] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      // Request camera permission
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');

      // Request location permission
      let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      }
    })();

    fetchTourists();
  }, []);

  const fetchTourists = async () => {
    try {
      setLoading(true);
      // In real app, fetch from blockchain
      setTourists(mockBlockchainData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch tourist data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTourists().finally(() => setRefreshing(false));
  }, []);

  const handleScan = async ({ data }) => {
    try {
      setScannerVisible(false);
      setLoading(true);
      
      // Verify on blockchain
      const verificationResult = await BlockchainService.verifyTourist(data);
      
      if (verificationResult) {
        const tourist = tourists.find(t => t.qrHash === data);
        if (tourist) {
          // Log verification with location
          await BlockchainService.logVerification(
            data,
            'OFFICER_ID', // Replace with actual officer ID
            location
          );
          verifyTouristID(tourist);
        }
      } else {
        Alert.alert('Invalid QR', 'This QR code is not registered in the system');
      }
    } catch (error) {
      Alert.alert('Error', 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // ...existing renderTouristCard...

  const VerificationModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>

          {selectedTourist && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.qrContainer}>
                <QRCode
                  value={selectedTourist.qrHash}
                  size={200}
                  color="#03474f"
                  backgroundColor="white"
                  logoBackgroundColor="white"
                />
              </View>

              <Text style={styles.verificationTitle}>Tourist Verification</Text>
              
              <View style={styles.touristInfo}>
                <InfoRow icon="person" label="Name" value={selectedTourist.name} />
                <InfoRow icon="flag" label="Nationality" value={selectedTourist.nationality} />
                <InfoRow icon="document" label="Passport" value={selectedTourist.passportNo} />
                <InfoRow icon="call" label="Emergency" value={selectedTourist.emergencyContact} />
                <InfoRow 
                  icon="time" 
                  label="Last Verified" 
                  value={new Date(selectedTourist.lastVerified).toLocaleString()} 
                />
              </View>

              <View style={styles.itinerarySection}>
                <Text style={styles.sectionTitle}>Itinerary</Text>
                {selectedTourist.itinerary.map((stop, index) => (
                  <View key={index} style={styles.itineraryItem}>
                    <Ionicons name="location" size={20} color="#03474f" />
                    <View style={styles.itineraryText}>
                      <Text style={styles.placeName}>{stop.place}</Text>
                      <Text style={styles.dates}>{stop.dates}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {selectedTourist.panicAlerts.length > 0 && (
                <View style={styles.alertsSection}>
                  <Text style={[styles.sectionTitle, styles.alertTitle]}>
                    ⚠️ Active Alerts
                  </Text>
                  {selectedTourist.panicAlerts.map((alert, index) => (
                    <View key={index} style={styles.alertItem}>
                      <Text style={styles.alertTime}>
                        {new Date(alert.timestamp).toLocaleString()}
                      </Text>
                      <Text style={styles.alertLocation}>
                        {alert.location}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity 
                style={styles.verifyButton}
                onPress={async () => {
                  try {
                    await BlockchainService.verifyTourist(selectedTourist.qrHash);
                    Alert.alert('Success', 'Verification recorded on blockchain');
                  } catch (error) {
                    Alert.alert('Error', 'Verification failed');
                  }
                }}
              >
                <Ionicons name="shield-checkmark" size={24} color="#fff" />
                <Text style={styles.verifyButtonText}>Verify on Blockchain</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  // ...existing InfoRow component...

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tourist Verification</Text>
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => setScannerVisible(true)}
        >
          <Ionicons name="scan" size={24} color="#fff" />
          <Text style={styles.scanButtonText}>Scan QR</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#03474f" style={styles.loader} />
      ) : (
        <FlatList
          data={tourists}
          keyExtractor={(item) => item.id}
          renderItem={renderTouristCard}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <VerificationModal />

      <Modal
        visible={scannerVisible}
        onRequestClose={() => setScannerVisible(false)}
      >
        <Camera
          style={StyleSheet.absoluteFillObject}
          onBarCodeScanned={handleScan}
        />
        <TouchableOpacity
          style={styles.closeScannerButton}
          onPress={() => setScannerVisible(false)}
        >
          <Ionicons name="close-circle" size={40} color="#fff" />
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // ...existing styles...
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#03474f',
    textAlign: 'center',
    marginBottom: 20,
  },
  // Add more styles as needed...
});