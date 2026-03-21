import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
  Linking
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from 'expo-location';
import { Ionicons } from "@expo/vector-icons";

// Web-compatible version
function LiveLocationWeb() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      getWebLocation();
    }
  }, []);

  const getWebLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
        });
        setLoading(false);
      },
      (error) => {
        setErrorMsg('Error getting location: ' + error.message);
        setLoading(false);
      }
    );
  };

  const openInGoogleMaps = () => {
    if (location) {
      const { latitude, longitude } = location.coords;
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d4105d" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMsg) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="location-off" size={64} color="#ff6b6b" />
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={getWebLocation}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Location (Web)</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={getWebLocation}>
          <Ionicons name="refresh" size={24} color="#d4105d" />
        </TouchableOpacity>
      </View>

      <View style={styles.locationInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color="#d4105d" />
          <Text style={styles.infoText}>
            Latitude: {location?.coords.latitude.toFixed(6)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color="#d4105d" />
          <Text style={styles.infoText}>
            Longitude: {location?.coords.longitude.toFixed(6)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="speedometer" size={20} color="#d4105d" />
          <Text style={styles.infoText}>
            Accuracy: {location?.coords.accuracy?.toFixed(2)} meters
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.mapButton} onPress={openInGoogleMaps}>
        <Ionicons name="map" size={24} color="#fff" />
        <Text style={styles.mapButtonText}>Open in Google Maps</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Location accessed via browser geolocation API
        </Text>
      </View>
    </SafeAreaView>
  );
}

// Native implementation for mobile devices
function LiveLocationNative() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      await getCurrentLocation();
      
      const interval = setInterval(getCurrentLocation, 30000);
      return () => clearInterval(interval);
    })();
  }, []);

  const getCurrentLocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      
      setLocation(location);
      setLoading(false);
    } catch (error) {
      setErrorMsg('Error getting location: ' + error.message);
      setLoading(false);
    }
  };

  const openInGoogleMaps = () => {
    if (location) {
      const { latitude, longitude } = location.coords;
      const url = Platform.OS === 'ios' 
        ? `http://maps.apple.com/?ll=${latitude},${longitude}`
        : `https://www.google.com/maps?q=${latitude},${longitude}`;
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d4105d" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMsg) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="location-off" size={64} color="#d4105d" />
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={getCurrentLocation}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Location</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={getCurrentLocation}>
          <Ionicons name="refresh" size={24} color="#d4105d" />
        </TouchableOpacity>
      </View>

      <View style={styles.locationInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color="#d4105d" />
          <Text style={styles.infoText}>
            Latitude: {location?.coords.latitude.toFixed(6)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color="#d4105d" />
          <Text style={styles.infoText}>
            Longitude: {location?.coords.longitude.toFixed(6)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="speedometer" size={20} color="#d4105d" />
          <Text style={styles.infoText}>
            Accuracy: {location?.coords.accuracy?.toFixed(2)} meters
          </Text>
        </View>
        {location?.coords.altitude && (
          <View style={styles.infoRow}>
            <Ionicons name="trending-up" size={20} color="#d4105d" />
            <Text style={styles.infoText}>
              Altitude: {location?.coords.altitude.toFixed(2)} meters
            </Text>
          </View>
        )}
        {location?.coords.speed && (
          <View style={styles.infoRow}>
            <Ionicons name="speedometer" size={20} color="#d4105d" />
            <Text style={styles.infoText}>
              Speed: {location?.coords.speed.toFixed(2)} m/s
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.mapButton} onPress={openInGoogleMaps}>
        <Ionicons name="map" size={24} color="#fff" />
        <Text style={styles.mapButtonText}>
          Open in {Platform.OS === 'ios' ? 'Apple Maps' : 'Google Maps'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Location updates every 30 seconds
        </Text>
      </View>
    </SafeAreaView>
  );
}

// Main component that switches between native and web
export default function LiveLocationScreen() {
  if (Platform.OS === 'web') {
    return <LiveLocationWeb />;
  }

  return <LiveLocationNative />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d4105d',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#d4105d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationInfo: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  mapButton: {
    flexDirection: 'row',
    backgroundColor: '#d4105d',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
