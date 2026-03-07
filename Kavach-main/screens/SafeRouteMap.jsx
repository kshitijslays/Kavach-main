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
import MapView, { Polyline, Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
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

// ------------------------------------------------------------------
// Helper: Calculate distance between two coords in meters (Haversine)
// ------------------------------------------------------------------
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const m = Math.PI / 180;
  const φ1 = lat1 * m;
  const φ2 = lat2 * m;
  const Δφ = (lat2 - lat1) * m;
  const Δλ = (lon2 - lon1) * m;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ------------------------------------------------------------------
// Generate mock crime zones between Origin and Destination
// ------------------------------------------------------------------
function generateCrimeZones(origin, dest) {
  const zones = [];
  const numZones = Math.floor(Math.random() * 3) + 2; // 2 to 4 zones
  
  for (let i = 0; i < numZones; i++) {
    // Pick a random point somewhere along the path
    const t = 0.2 + (Math.random() * 0.6); // Between 20% and 80% of the way
    const lat = origin.latitude + (dest.latitude - origin.latitude) * t + (Math.random() - 0.5) * 0.02;
    const lng = origin.longitude + (dest.longitude - origin.longitude) * t + (Math.random() - 0.5) * 0.02;
    
    zones.push({
      id: i,
      latitude: lat,
      longitude: lng,
      radius: Math.floor(Math.random() * 800) + 400, // 400m to 1200m radius
      type: Math.random() > 0.4 ? "red" : "yellow" // 60% high risk, 40% mod risk
    });
  }
  return zones;
}

// ------------------------------------------------------------------
// Segment route arrays based on intersection with crime zones
// ------------------------------------------------------------------
function segmentRoute(points, crimeZones) {
  if (!points || points.length === 0) return [];

  const segments = [];
  let currentSegment = [];
  let currentSafety = "green"; // Default

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    
    // Check if point is inside any crime zone
    let pointSafety = "green";
    for (const zone of crimeZones) {
      const dist = getDistance(pt.latitude, pt.longitude, zone.latitude, zone.longitude);
      if (dist <= zone.radius) {
        if (zone.type === "red") {
          pointSafety = "red";
          break; // Red overrides yellow
        } else if (zone.type === "yellow") {
          pointSafety = "yellow";
        }
      }
    }

    if (currentSegment.length === 0) {
      currentSegment.push(pt);
      currentSafety = pointSafety;
    } else if (pointSafety === currentSafety) {
      currentSegment.push(pt);
    } else {
      // Safety level changed -> end current segment and start a new one
      // Include the current point in both segments perfectly connect the polylines
      currentSegment.push(pt); 
      segments.push({ color: currentSafety, points: currentSegment });

      currentSegment = [pt];
      currentSafety = pointSafety;
    }
  }

  if (currentSegment.length > 0) {
    segments.push({ color: currentSafety, points: currentSegment });
  }

  return segments;
}

// Calculate an overall route score (0-100) based on segment distances
function scoreSegmentedRoute(segments) {
  let redPts = 0, yellowPts = 0, greenPts = 0;
  segments.forEach(seg => {
    if (seg.color === "red") redPts += seg.points.length;
    else if (seg.color === "yellow") yellowPts += seg.points.length;
    else greenPts += seg.points.length;
  });
  
  const total = redPts + yellowPts + greenPts;
  if (total === 0) return 100;
  
  // High penalty for red, moderate for yellow
  let score = 100 - ((redPts / total) * 100) - ((yellowPts / total) * 30);
  return Math.max(0, Math.round(score));
}

function routeColor(rank) {
  if (rank === 0) return "#27AE60";
  if (rank === 1) return "#F39C12";
  return "#E74C3C";
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
  const [crimeZones, setCrimeZones] = useState([]);
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

      // Generate mock crime zones between the two points to simulate safety analysis
      const newCrimeZones = generateCrimeZones(originCoord, destCoord);
      setCrimeZones(newCrimeZones);

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

      const parsed = data.routes.map((r, i) => {
        const rawPoints = decodePolyline(r.geometry);
        const segments = segmentRoute(rawPoints, newCrimeZones);
        const routeScore = scoreSegmentedRoute(segments);
        
        return {
          segments,
          score: routeScore,
          points: rawPoints, // Full array for map bounding box
          distance: r.summary.distance,
          duration: r.summary.duration,
          distanceText: (r.summary.distance / 1000).toFixed(1) + " km",
          durationText: Math.round(r.summary.duration / 60) + " mins",
          summary: `Route ${i + 1}`,
          originCoord,
          destCoord: { latitude: destCoord.latitude, longitude: destCoord.longitude },
        };
      });

      const scored = parsed.sort((a, b) => b.score - a.score);

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

      {/* ── Map (Full Screen Background) ── */}
      <View style={styles.mapContainer}>
        {locationLoading ? (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator size="large" color="#3182CE" />
            <Text style={styles.mapPlaceholderText}>Getting your location…</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            provider={PROVIDER_GOOGLE}
            initialRegion={initialRegion}
            showsUserLocation
            showsMyLocationButton={false} // We custom position it or rely on the UI
          >
            {/* Draw Simulated Crime Zones */}
            {crimeZones.map((zone, i) => (
              <Circle
                key={`zone_${i}`}
                center={{ latitude: zone.latitude, longitude: zone.longitude }}
                radius={zone.radius}
                fillColor={zone.type === "red" ? "rgba(231, 76, 60, 0.25)" : "rgba(243, 156, 18, 0.25)"}
                strokeColor={zone.type === "red" ? "rgba(231, 76, 60, 0.5)" : "rgba(243, 156, 18, 0.5)"}
                strokeWidth={1}
              />
            ))}

            {/* Draw each route in Segments */}
            {routes.map((route, routeIdx) => (
              route.segments.map((seg, segIdx) => {
                let sColor = "#27AE60"; // green
                if (seg.color === "red") sColor = "#E74C3C";
                if (seg.color === "yellow") sColor = "#F39C12";

                const isSelected = routeIdx === selectedRoute;

                return (
                  <Polyline
                    key={`route_${routeIdx}_seg_${segIdx}`}
                    coordinates={seg.points}
                    strokeColor={isSelected ? sColor : sColor + "55"}
                    strokeWidth={isSelected ? 6 : 4}
                    lineDashPattern={isSelected ? null : [6, 4]}
                    tappable={true}
                    onPress={() => setSelectedRoute(routeIdx)}
                    zIndex={isSelected ? 10 : 2}
                  />
                );
              })
            ))}

            {/* Origin marker */}
            {userLocation && (
              <Marker coordinate={userLocation} title="You are here" pinColor="#3182CE" />
            )}

            {/* Destination marker */}
            {routes.length > 0 && (
              <Marker
                coordinate={routes[0].destCoord}
                title={destination || "Destination"}
                pinColor="#0F172A"
              />
            )}
          </MapView>
        )}
      </View>

      {/* ── Floating Top Card (Header + Inputs) ── */}
      <View style={styles.topCardWrapper}>
        <View style={styles.floatingHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Safe Route</Text>
          </View>
          <View style={styles.headerRight}>
            <Ionicons name="shield-checkmark" size={24} color="#3182CE" />
          </View>
        </View>

        {/* Search Inputs */}
        <View style={styles.searchContainer}>
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
                <Ionicons name="locate" size={16} color="#3182CE" />
                <Text style={styles.currentLocText} numberOfLines={1}>{locationLabel}</Text>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            ) : (
              <View style={{ flex: 1 }}>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Start location..."
                    placeholderTextColor="#94A3B8"
                    value={source}
                    onChangeText={handleSourceChange}
                    onFocus={() => { if (sourceSuggestions.length) setShowSourceSuggestions(true); setShowDestSuggestions(false); }}
                    returnKeyType="next"
                  />
                  <TouchableOpacity onPress={handleUseCurrentLocation}>
                    <Ionicons name="locate" size={18} color="#3182CE" />
                  </TouchableOpacity>
                </View>
                {/* Autocomplete for Source */}
                {showSourceSuggestions && sourceSuggestions.length > 0 && (
                  <View style={styles.suggestionsWrapper}>
                    {sourceSuggestions.map((item, i) => (
                      <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => selectSource(item)}>
                        <Ionicons name="location-outline" size={16} color="#64748B" />
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
                  placeholder="Where to?"
                  placeholderTextColor="#94A3B8"
                  value={destination}
                  onChangeText={handleDestChange}
                  onFocus={() => { if (destSuggestions.length) setShowDestSuggestions(true); setShowSourceSuggestions(false); }}
                  onSubmitEditing={fetchRoutes}
                  returnKeyType="search"
                />
                {destination.length > 0 && (
                  <TouchableOpacity onPress={() => { setDestination(""); setRoutes([]); setShowDestSuggestions(false); }}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
              {/* Autocomplete for Destination */}
              {showDestSuggestions && destSuggestions.length > 0 && (
                <View style={styles.suggestionsWrapper}>
                  {destSuggestions.map((item, i) => (
                    <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => selectDest(item)}>
                      <Ionicons name="location-outline" size={16} color="#64748B" />
                      <Text style={styles.suggestionText} numberOfLines={1}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Search Button */}
          {!routes.length && (
            <TouchableOpacity
              style={[styles.goBtn, loading && { opacity: 0.6 }]}
              onPress={fetchRoutes}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.goBtnText}>Find Safe Routes</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Floating Bottom Sheet Card (For route results) ── */}
      <View style={styles.bottomSheetWrapper}>
        {routes.length > 0 && (
          <View style={styles.bottomSheetCard}>
            {/* Handle */}
            <View style={styles.sheetHandle} />

          {/* ── Routes Result Panel ── */}
            <View style={styles.panel}>
              <View style={styles.panelHeaderRow}>
                <Text style={styles.panelTitle}>Suggested Routes</Text>
                {loading && <ActivityIndicator color="#3182CE" size="small" />}
              </View>
              
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
                        backgroundColor: "rgba(255,255,255,1)",
                        shadowColor: routeColor(idx),
                        shadowOpacity: 0.15,
                        elevation: 10,
                        borderWidth: 2,
                      },
                      idx !== selectedRoute && {
                        borderColor: "#E2E8F0",
                      }
                    ]}
                    onPress={() => setSelectedRoute(idx)}
                  >
                    <View style={styles.cardTopRow}>
                      <View style={[styles.routeBadge, { backgroundColor: routeColor(idx) }]}>
                        <Text style={styles.routeBadgeText}>
                           {idx === 0 ? "Safest" : `Option ${idx + 1}`}
                        </Text>
                      </View>
                      <Text style={[styles.safetyScore, { color: routeColor(idx) }]}>
                        {route.score}% Safe
                      </Text>
                    </View>
                    
                    <Text style={styles.routeSummary} numberOfLines={1}>
                      {route.summary}
                    </Text>
                    
                    <View style={styles.routeMeta}>
                      <View style={styles.metaBadge}>
                        <Ionicons name="time" size={14} color="#64748B" />
                        <Text style={styles.routeMetaText}>{route.durationText}</Text>
                      </View>
                      <View style={styles.metaBadge}>
                        <Ionicons name="navigate" size={14} color="#64748B" />
                        <Text style={styles.routeMetaText}>{route.distanceText}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#E2E8F0",
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    gap: 12,
  },
  mapPlaceholderText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },

  // Top Card Header
  topCardWrapper: {
    position: 'absolute',
    top: Platform.OS === "android" ? StatusBar.currentHeight + 16 : 56,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
  },
  floatingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitleContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerRight: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 0, // removed elevation since it's inside a bordered card now
  },

  // Bottom Sheet UI
  bottomSheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  bottomSheetCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 32 : 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },

  // Search Container
  searchContainer: {
    paddingHorizontal: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  dotGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981", // Emerald
    borderWidth: 3,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  dotRed: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#EF4444", // Red
    borderWidth: 3,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  connector: {
    marginLeft: 5,
    width: 2,
    paddingVertical: 6,
    alignItems: "center",
    gap: 4,
  },
  connectorDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#CBD5E1",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  searchInput: {
    flex: 1,
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "500",
  },
  suggestionsWrapper: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  suggestionText: {
    color: "#475569",
    fontSize: 14,
    flex: 1,
  },
  currentLocBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(49, 130, 206, 0.08)",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: "rgba(49, 130, 206, 0.2)",
    gap: 12,
  },
  currentLocText: {
    flex: 1,
    color: "#3182CE",
    fontSize: 15,
    fontWeight: "600",
  },
  goBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  goBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  // Bottom Panel (Routes)
  panel: {
    marginTop: 24,
    paddingBottom: 8,
  },
  panelHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  routeScroll: {
    paddingLeft: 24,
  },
  routeCard: {
    width: 240,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginRight: 16,
    backgroundColor: "#F8FAFC",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  routeBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  routeBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  safetyScore: {
    fontSize: 14,
    fontWeight: "800",
  },
  routeSummary: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  routeMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  routeMetaText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },
});
