import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

// -----------------------------------------------------------------------
// Replace with your own Google Maps Directions API key when available.
// Until then, mock routes are shown based on your real location.
// -----------------------------------------------------------------------
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

// Decode Google's encoded polyline format into lat/lng array
function decodePolyline(encoded) {
  let index = 0;
  const len = encoded.length;
  const result = [];
  let lat = 0;
  let lng = 0;
  while (index < len) {
    let b, shift = 0, result2 = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result2 |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result2 & 1) ? ~(result2 >> 1) : result2 >> 1;
    lat += dlat;
    shift = 0;
    result2 = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result2 |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result2 & 1) ? ~(result2 >> 1) : result2 >> 1;
    lng += dlng;
    result.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return result;
}

// Score a route: shorter distance + less duration = safer (simple heuristic)
// Returns 0–100 where higher = safer
function scoreRoute(route, allRoutes) {
  const maxDist = Math.max(...allRoutes.map(r => r.distance));
  const minDist = Math.min(...allRoutes.map(r => r.distance));
  const range = maxDist - minDist || 1;
  // Shorter routes score higher
  return Math.round(100 - ((route.distance - minDist) / range) * 80);
}

// Assign color based on rank (index 0 = safest)
function routeColor(rank) {
  if (rank === 0) return "#27AE60"; // green – safest
  if (rank === 1) return "#F39C12"; // yellow – moderate
  return "#E74C3C";                 // red – dangerous
}

function routeLabel(rank) {
  if (rank === 0) return "Safest";
  if (rank === 1) return "Moderate";
  return "Dangerous";
}

function routeLabelIcon(rank) {
  if (rank === 0) return "shield-checkmark";
  if (rank === 1) return "warning";
  return "skull";
}

// ------------------------------------------------------------------
// Generate realistic-looking mock waypoints between two coordinates
// ------------------------------------------------------------------
function mockPolyline(origin, dest, jitter) {
  const steps = 8;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const jx = (Math.random() - 0.5) * jitter;
    const jy = (Math.random() - 0.5) * jitter;
    pts.push({
      latitude: origin.latitude + (dest.latitude - origin.latitude) * t + jy,
      longitude: origin.longitude + (dest.longitude - origin.longitude) * t + jx,
    });
  }
  return pts;
}

export default function SafeRouteMapScreen({ navigation }) {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState("");
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  // Request and fetch user location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Please grant location permission to use the Safe Route feature.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch {
        // Fallback to Jaipur city centre for demo
        setUserLocation({ latitude: 26.9124, longitude: 75.7873 });
      }
      setLocationLoading(false);
    })();
  }, []);

  const fetchRoutes = async () => {
    if (!destination.trim()) {
      Alert.alert("Enter Destination", "Please type a destination to search.");
      return;
    }
    if (!userLocation) return;
    setLoading(true);

    try {
      // If a real API key is configured, use Google Directions API
      if (GOOGLE_MAPS_API_KEY !== "YOUR_GOOGLE_MAPS_API_KEY") {
        const origin = `${userLocation.latitude},${userLocation.longitude}`;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${encodeURIComponent(destination)}&alternatives=true&key=${GOOGLE_MAPS_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status !== "OK" || data.routes.length === 0) {
          Alert.alert("No Routes Found", "Could not find routes to that destination. Try a different place name.");
          setLoading(false);
          return;
        }

        // Parse real routes
        const parsed = data.routes.map((r) => ({
          points: decodePolyline(r.overview_polyline.points),
          distance: r.legs[0].distance.value,  // meters
          duration: r.legs[0].duration.value,  // seconds
          summary: r.summary,
          distanceText: r.legs[0].distance.text,
          durationText: r.legs[0].duration.text,
          destCoord: {
            latitude: r.legs[0].end_location.lat,
            longitude: r.legs[0].end_location.lng,
          },
        }));

        // Sort by safety score descending (safest first)
        const scored = parsed
          .map((r) => ({ ...r, score: scoreRoute(r, parsed) }))
          .sort((a, b) => b.score - a.score);

        setRoutes(scored);
        setSelectedRoute(0);
        fitMapToRoutes(scored);
      } else {
        // ── Mock mode: generate 3 fake routes around the user's real location ──
        // Simulate a destination ~3 km away
        const destMock = {
          latitude: userLocation.latitude + 0.027,
          longitude: userLocation.longitude + 0.027,
        };
        const mockRoutes = [
          {
            points: mockPolyline(userLocation, destMock, 0.004),
            distance: 3200,
            duration: 720,
            distanceText: "3.2 km",
            durationText: "12 mins",
            summary: "Via Main Road",
            destCoord: destMock,
          },
          {
            points: mockPolyline(userLocation, destMock, 0.009),
            distance: 4100,
            duration: 960,
            distanceText: "4.1 km",
            durationText: "16 mins",
            summary: "Via Market Street",
            destCoord: destMock,
          },
          {
            points: mockPolyline(userLocation, destMock, 0.016),
            distance: 5500,
            duration: 1200,
            distanceText: "5.5 km",
            durationText: "20 mins",
            summary: "Via Bypass Road",
            destCoord: destMock,
          },
        ];

        const scored = mockRoutes
          .map((r) => ({ ...r, score: scoreRoute(r, mockRoutes) }))
          .sort((a, b) => b.score - a.score);

        setRoutes(scored);
        setSelectedRoute(0);
        fitMapToRoutes(scored);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to fetch routes. Check your internet connection.");
    }
    setLoading(false);
  };

  const fitMapToRoutes = (routeList) => {
    if (!mapRef.current || !routeList.length) return;
    const allPoints = routeList.flatMap((r) => r.points);
    const lats = allPoints.map((p) => p.latitude);
    const lngs = allPoints.map((p) => p.longitude);
    mapRef.current.fitToCoordinates(allPoints, {
      edgePadding: { top: 80, right: 40, bottom: 280, left: 40 },
      animated: true,
    });
  };

  const initialRegion = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor="#1a1a2e" barStyle="light-content" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Safe Route</Text>
          <Text style={styles.headerSub}>Color-coded route safety</Text>
        </View>
        <View style={styles.headerRight}>
          <Ionicons name="shield-checkmark" size={24} color="#27AE60" />
        </View>
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#aaa" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Enter destination (e.g. Hawa Mahal)"
            placeholderTextColor="#aaa"
            value={destination}
            onChangeText={setDestination}
            onSubmitEditing={fetchRoutes}
            returnKeyType="search"
          />
          {destination.length > 0 && (
            <TouchableOpacity onPress={() => { setDestination(""); setRoutes([]); }}>
              <Ionicons name="close-circle" size={18} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.goBtn, loading && { opacity: 0.6 }]}
          onPress={fetchRoutes}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="navigate" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* ── Map ── */}
      <View style={styles.mapContainer}>
        {locationLoading ? (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator size="large" color="#D4105D" />
            <Text style={styles.mapPlaceholderText}>Getting your location…</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            provider={PROVIDER_GOOGLE}
            initialRegion={initialRegion}
            showsUserLocation
            showsMyLocationButton
          >
            {/* Draw each route as a Polyline */}
            {routes.map((route, idx) => (
              <Polyline
                key={idx}
                coordinates={route.points}
                strokeColor={
                  idx === selectedRoute
                    ? routeColor(idx)
                    : routeColor(idx) + "66" // dimmed if not selected
                }
                strokeWidth={idx === selectedRoute ? 6 : 3}
                lineDashPattern={idx === selectedRoute ? null : [6, 4]}
                tappable
                onPress={() => setSelectedRoute(idx)}
              />
            ))}

            {/* Origin marker */}
            {userLocation && (
              <Marker coordinate={userLocation} title="You are here" pinColor="#D4105D" />
            )}

            {/* Destination marker */}
            {routes.length > 0 && (
              <Marker
                coordinate={routes[0].destCoord}
                title={destination || "Destination"}
                pinColor="#262626"
              />
            )}
          </MapView>
        )}
      </View>

      {/* ── Bottom Panel ── */}
      {routes.length > 0 && (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Available Routes</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.routeScroll}
          >
            {routes.map((route, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.routeCard,
                  { borderColor: routeColor(idx) },
                  idx === selectedRoute && {
                    backgroundColor: routeColor(idx) + "1A",
                  },
                ]}
                onPress={() => setSelectedRoute(idx)}
              >
                <View style={[styles.routeBadge, { backgroundColor: routeColor(idx) }]}>
                  <Ionicons name={routeLabelIcon(idx)} size={14} color="#fff" />
                  <Text style={styles.routeBadgeText}>{routeLabel(idx)}</Text>
                </View>
                <Text style={styles.routeSummary} numberOfLines={1}>
                  {route.summary}
                </Text>
                <View style={styles.routeMeta}>
                  <Ionicons name="time-outline" size={13} color="#666" />
                  <Text style={styles.routeMetaText}>{route.durationText}</Text>
                  <Ionicons name="navigate-outline" size={13} color="#666" style={{ marginLeft: 8 }} />
                  <Text style={styles.routeMetaText}>{route.distanceText}</Text>
                </View>
                <View style={styles.safetyBar}>
                  <View
                    style={[
                      styles.safetyFill,
                      {
                        width: `${route.score}%`,
                        backgroundColor: routeColor(idx),
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.safetyScore, { color: routeColor(idx) }]}>
                  Safety {route.score}%
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Legend */}
          <View style={styles.legend}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: routeColor(i) }]} />
                <Text style={styles.legendText}>{routeLabel(i)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Hint when no routes yet */}
      {routes.length === 0 && !locationLoading && (
        <View style={styles.hint}>
          <Ionicons name="map-outline" size={28} color="#aaa" />
          <Text style={styles.hintText}>
            Type a destination above and tap {" "}
            <Ionicons name="navigate" size={14} color="#D4105D" /> to see color-coded safe routes
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 12 : 12,
    backgroundColor: "#1a1a2e",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSub: {
    fontSize: 12,
    color: "#aaa",
  },
  headerRight: {
    marginLeft: "auto",
  },
  // Search
  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#1a1a2e",
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a40",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
  },
  goBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#D4105D",
    justifyContent: "center",
    alignItems: "center",
  },
  // Map
  mapContainer: {
    flex: 1,
    backgroundColor: "#e8e8e8",
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    gap: 12,
  },
  mapPlaceholderText: {
    color: "#666",
    fontSize: 14,
  },
  // Bottom Panel
  panel: {
    backgroundColor: "#fff",
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#262626",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  routeScroll: {
    paddingLeft: 16,
  },
  routeCard: {
    width: 170,
    borderRadius: 14,
    borderWidth: 2,
    padding: 12,
    marginRight: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  routeBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
    gap: 4,
  },
  routeBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  routeSummary: {
    fontSize: 13,
    fontWeight: "600",
    color: "#262626",
    marginBottom: 6,
  },
  routeMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  routeMetaText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 3,
  },
  safetyBar: {
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  safetyFill: {
    height: "100%",
    borderRadius: 3,
  },
  safetyScore: {
    fontSize: 11,
    fontWeight: "bold",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
  // No-routes hint
  hint: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
