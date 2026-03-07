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
  FlatList,
  Keyboard,
} from "react-native";
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

// -----------------------------------------------------------------------
// OpenRouteService API Key (free, no credit card required)
// -----------------------------------------------------------------------
const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjBiYjM1NDViZDViNzQ3YjhhNTdhMzNiNWNjMDQ4ZWI0IiwiaCI6Im11cm11cjY0In0=";

// Geocode a place name using ORS Geocoding API → {latitude, longitude, label}
async function geocodePlace(text) {
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(text)}&size=1`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.features || data.features.length === 0) return null;
  const [lng, lat] = data.features[0].geometry.coordinates;
  const label = data.features[0].properties.label || text;
  return { latitude: lat, longitude: lng, label };
}

// Fetch autocomplete suggestions
async function fetchSuggestions(text) {
  if (!text || text.length < 3) return [];
  const url = `https://api.openrouteservice.org/geocode/autocomplete?api_key=${ORS_API_KEY}&text=${encodeURIComponent(text)}&size=5`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.features) return [];
    return data.features.map(f => {
      const [lng, lat] = f.geometry.coordinates;
      return {
        label: f.properties.label || f.properties.name || text,
        latitude: lat,
        longitude: lng
      };
    });
  } catch (err) {
    return [];
  }
}

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
  const [source, setSource] = useState("");           // typed source address
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(true); // true = use GPS
  const [destination, setDestination] = useState("");
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationLabel, setLocationLabel] = useState("Current Location"); // display label

  // Autocomplete states
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

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
        // Reverse geocode to get a readable label
        const rev = await Location.reverseGeocodeAsync(loc.coords);
        if (rev && rev.length > 0) {
          const r = rev[0];
          setLocationLabel([r.name, r.city].filter(Boolean).join(", ") || "Current Location");
        }
      } catch {
        // Fallback to Jaipur city centre for demo
        setUserLocation({ latitude: 26.9124, longitude: 75.7873 });
      }
      setLocationLoading(false);
    })();
  }, []);

  // When user taps "Use Current Location" — resets source to GPS
  const handleUseCurrentLocation = () => {
    setSource("");
    setUsingCurrentLocation(true);
    setRoutes([]);
    setShowSourceSuggestions(false);
  };

  const handleSourceChange = async (text) => {
    setSource(text);
    setRoutes([]);
    if (text.length >= 3) {
      const results = await fetchSuggestions(text);
      setSourceSuggestions(results);
      setShowSourceSuggestions(true);
    } else {
      setShowSourceSuggestions(false);
    }
  };

  const handleDestChange = async (text) => {
    setDestination(text);
    setRoutes([]);
    if (text.length >= 3) {
      const results = await fetchSuggestions(text);
      setDestSuggestions(results);
      setShowDestSuggestions(true);
    } else {
      setShowDestSuggestions(false);
    }
  };

  const selectSource = (item) => {
    setSource(item.label);
    setShowSourceSuggestions(false);
    Keyboard.dismiss();
  };

  const selectDest = (item) => {
    setDestination(item.label);
    setShowDestSuggestions(false);
    Keyboard.dismiss();
  };

  const fetchRoutes = async () => {
    if (!destination.trim()) {
      Alert.alert("Enter Destination", "Please enter a destination address.");
      return;
    }
    if (!usingCurrentLocation && !source.trim()) {
      Alert.alert("Enter Source", "Please enter a source address or use current location.");
      return;
    }
    setLoading(true);

    try {
      // Resolve source coordinates
      let originCoord;
      if (usingCurrentLocation) {
        if (!userLocation) {
          Alert.alert("Location unavailable", "GPS location not ready yet. Try again in a moment.");
          setLoading(false);
          return;
        }
        originCoord = { ...userLocation, label: locationLabel };
      } else {
        originCoord = await geocodePlace(source);
        if (!originCoord) {
          Alert.alert(
            "Source Not Found",
            `Could not find "${source}". Try a more specific address.`
          );
          setLoading(false);
          return;
        }
      }

      // Resolve destination coordinates
      const destCoord = await geocodePlace(destination);
      if (!destCoord) {
        Alert.alert(
          "Destination Not Found",
          `Could not find "${destination}". Try a more specific name, e.g. "Hawa Mahal, Jaipur".`
        );
        setLoading(false);
        return;
      }

      // Fetch up to 3 alternative driving routes from ORS (GeoJSON: [lng, lat])
      const body = {
        coordinates: [
          [originCoord.longitude, originCoord.latitude],
          [destCoord.longitude, destCoord.latitude],
        ],
        alternative_routes: {
          target_count: 3,
          weight_factor: 1.6,
          share_factor: 0.6,
        },
      };

      const res = await fetch(
        "https://api.openrouteservice.org/v2/directions/driving-car",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: ORS_API_KEY,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (!data.routes || data.routes.length === 0) {
        Alert.alert("No Routes Found", "Could not find driving routes between these two locations.");
        setLoading(false);
        return;
      }

      const parsed = data.routes.map((r, i) => ({
        points: decodePolyline(r.geometry),
        distance: r.summary.distance,
        duration: r.summary.duration,
        distanceText: (r.summary.distance / 1000).toFixed(1) + " km",
        durationText: Math.round(r.summary.duration / 60) + " mins",
        summary: `Route ${i + 1}`,
        originCoord,
        destCoord: { latitude: destCoord.latitude, longitude: destCoord.longitude },
      }));

      const scored = parsed
        .map((r) => ({ ...r, score: scoreRoute(r, parsed) }))
        .sort((a, b) => b.score - a.score);

      setRoutes(scored);
      setSelectedRoute(0);
      fitMapToRoutes(scored);
    } catch (err) {
      console.error("Route fetch error:", err);
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

      {/* ── Source + Destination Inputs ── */}
      <View style={styles.searchPanel}>
        {/* Source Row */}
        <View style={styles.inputRow}>
          <View style={styles.dotGreen} />
          {usingCurrentLocation ? (
            <TouchableOpacity
              style={styles.currentLocBtn}
              onPress={() => {
                setUsingCurrentLocation(false);
                setSource("");
                setRoutes([]);
              }}
            >
              <Ionicons name="locate" size={14} color="#27AE60" />
              <Text style={styles.currentLocText} numberOfLines={1}>{locationLabel}</Text>
              <Ionicons name="close-circle" size={14} color="#aaa" />
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }}>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Type source address..."
                  placeholderTextColor="#aaa"
                  value={source}
                  onChangeText={handleSourceChange}
                  onFocus={() => { if (sourceSuggestions.length) setShowSourceSuggestions(true); setShowDestSuggestions(false); }}
                  returnKeyType="next"
                />
                <TouchableOpacity onPress={handleUseCurrentLocation}>
                  <Ionicons name="locate" size={18} color="#27AE60" />
                </TouchableOpacity>
              </View>
              {/* Autocomplete for Source */}
              {showSourceSuggestions && sourceSuggestions.length > 0 && (
                <View style={styles.suggestionsWrapper}>
                  {sourceSuggestions.map((item, i) => (
                    <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => selectSource(item)}>
                      <Ionicons name="location-outline" size={16} color="#aaa" />
                      <Text style={styles.suggestionText} numberOfLines={1}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Dotted line connector */}
        <View style={styles.connector}>
          <View style={styles.connectorDot} />
          <View style={styles.connectorDot} />
          <View style={styles.connectorDot} />
        </View>

        {/* Destination Row */}
        <View style={styles.inputRow}>
          <View style={styles.dotRed} />
          <View style={{ flex: 1 }}>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter destination address..."
                placeholderTextColor="#aaa"
                value={destination}
                onChangeText={handleDestChange}
                onFocus={() => { if (destSuggestions.length) setShowDestSuggestions(true); setShowSourceSuggestions(false); }}
                onSubmitEditing={fetchRoutes}
                returnKeyType="search"
              />
              {destination.length > 0 && (
                <TouchableOpacity onPress={() => { setDestination(""); setRoutes([]); setShowDestSuggestions(false); }}>
                  <Ionicons name="close-circle" size={18} color="#aaa" />
                </TouchableOpacity>
              )}
            </View>
            {/* Autocomplete for Destination */}
            {showDestSuggestions && destSuggestions.length > 0 && (
              <View style={styles.suggestionsWrapper}>
                {destSuggestions.map((item, i) => (
                  <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => selectDest(item)}>
                    <Ionicons name="location-outline" size={16} color="#aaa" />
                    <Text style={styles.suggestionText} numberOfLines={1}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Search Button */}
        <TouchableOpacity
          style={[styles.goBtn, loading && { opacity: 0.6 }]}
          onPress={fetchRoutes}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="navigate" size={18} color="#fff" />
              <Text style={styles.goBtnText}>Find Safe Routes</Text>
            </>
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
  // Search Panel
  searchPanel: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#1a1a2e",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#27AE60",
    borderWidth: 2,
    borderColor: "#1a1a2e",
  },
  dotRed: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E74C3C",
    borderWidth: 2,
    borderColor: "#1a1a2e",
  },
  connector: {
    marginLeft: 4,
    width: 2,
    paddingVertical: 4,
    alignItems: "center",
    gap: 4,
  },
  connectorDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#444",
  },
  inputBox: {
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
  suggestionsWrapper: {
    backgroundColor: "#2a2a40",
    borderRadius: 8,
    marginTop: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#3a3a50",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  suggestionText: {
    color: "#e0e0e0",
    fontSize: 13,
    flex: 1,
  },
  currentLocBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(39, 174, 96, 0.15)",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: "rgba(39, 174, 96, 0.3)",
    gap: 8,
  },
  currentLocText: {
    flex: 1,
    color: "#27AE60",
    fontSize: 14,
    fontWeight: "500",
  },
  goBtn: {
    flexDirection: "row",
    height: 46,
    borderRadius: 12,
    backgroundColor: "#D4105D",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  goBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
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
