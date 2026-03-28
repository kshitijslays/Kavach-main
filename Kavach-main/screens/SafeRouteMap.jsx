import React, { useState, useEffect, useRef } from "react";
import {
  FlatList,
  Keyboard,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  TextInput,
  ScrollView,
  useWindowDimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Polyline, Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { fetchStreetLightsInArea, calculateRouteBounds, fetchBusinessAndPopulationData } from "../services/streetLightingService";

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
// Segment route arrays based on lighting conditions
// ------------------------------------------------------------------
function segmentRoute(points, lightingData) {
  if (!points || points.length === 0) return [];

  console.log(`Segmenting route with ${points.length} points and ${lightingData.length} lighting elements`);

  const segments = [];
  let currentSegment = [];
  let currentLighting = "unknown";

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];

    // Determine lighting status for this point
    const pointLighting = determineLightingAtPoint(pt, lightingData);

    if (currentSegment.length === 0) {
      currentSegment.push(pt);
      currentLighting = pointLighting;
    } else if (pointLighting === currentLighting) {
      currentSegment.push(pt);
    } else {
      // Lighting status changed -> end current segment and start a new one
      currentSegment.push(pt);
      segments.push({
        color: getLightingColor(currentLighting),
        points: currentSegment,
        lighting: currentLighting
      });

      currentSegment = [pt];
      currentLighting = pointLighting;
    }
  }

  if (currentSegment.length > 0) {
    segments.push({
      color: getLightingColor(currentLighting),
      points: currentSegment,
      lighting: determineLightingAtPoint(currentSegment[0], lightingData)
    });
  }

  console.log(`Created ${segments.length} segments`);
  return segments;
}

function determineLightingAtPoint(point, lightingData) {
  // Check proximity to street lamps (within 50 meters)
  const nearbyLamps = lightingData.filter(light =>
    light.type === 'street_lamp' &&
    getDistance(point.latitude, point.longitude,
      light.position.latitude, light.position.longitude) <= 50 // 50 meters
  );

  if (nearbyLamps.length > 0) {
    console.log(`Point (${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}) is well_lit (${nearbyLamps.length} lamps nearby)`);
    return "well_lit";
  }

  // Check if point is on a lit road
  const litRoads = lightingData.filter(light =>
    light.type === 'road_segment' && light.isLit &&
    isPointOnWay(point, light.geometry)
  );

  if (litRoads.length > 0) {
    console.log(`Point (${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}) is lit (${litRoads.length} lit roads)`);
    return "lit";
  }

  console.log(`Point (${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}) is unlit`);
  return "unlit";
}

function getLightingColor(lighting) {
  switch (lighting) {
    case "well_lit": return "green";
    case "lit": return "yellow";
    case "unlit": return "red";
    default: return "gray";
  }
}

function isPointOnWay(point, wayGeometry) {
  if (!wayGeometry || wayGeometry.length < 2) return false;

  // Simple check: see if point is close to any segment of the way
  for (let i = 0; i < wayGeometry.length - 1; i++) {
    const p1 = wayGeometry[i];
    const p2 = wayGeometry[i + 1];

    // Check if point is within 20 meters of the line segment
    if (pointToLineDistance(point, p1, p2) <= 20) { // 20 meters
      return true;
    }
  }
  return false;
}

function pointToLineDistance(point, lineStart, lineEnd) {
  const A = point.longitude - lineStart.lon;
  const B = point.latitude - lineStart.lat;
  const C = lineEnd.lon - lineStart.lon;
  const D = lineEnd.lat - lineStart.lat;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;

  if (lenSq === 0) return getDistance(point.latitude, point.longitude, lineStart.lat, lineStart.lon);

  const param = dot / lenSq;

  let xx, yy;
  if (param < 0) {
    xx = lineStart.lon;
    yy = lineStart.lat;
  } else if (param > 1) {
    xx = lineEnd.lon;
    yy = lineEnd.lat;
  } else {
    xx = lineStart.lon + param * C;
    yy = lineStart.lat + param * D;
  }

  return getDistance(point.latitude, point.longitude, yy, xx);
}

// Calculate lighting-based safety score (0-100)
function scoreRouteByLighting(segments) {
  let wellLitPoints = 0, litPoints = 0, unlitPoints = 0;

  console.log('Scoring route with', segments.length, 'segments');

  segments.forEach((seg, index) => {
    const pointCount = seg.points.length;
    console.log(`Segment ${index}: ${pointCount} points, lighting: ${seg.lighting}`);
    if (seg.lighting === "well_lit") wellLitPoints += pointCount;
    else if (seg.lighting === "lit") litPoints += pointCount;
    else if (seg.lighting === "unlit") unlitPoints += pointCount;
  });

  const total = wellLitPoints + litPoints + unlitPoints;
  console.log(`Total points: well_lit=${wellLitPoints}, lit=${litPoints}, unlit=${unlitPoints}, total=${total}`);

  if (total === 0) return 50;

  // Lighting safety score (0-100)
  // Well-lit areas get high scores, unlit areas get penalties
  const score = (
    (wellLitPoints / total) * 100 +     // 100% for well-lit
    (litPoints / total) * 70 -          // 70% for lit roads
    (unlitPoints / total) * 50          // -50% penalty for unlit
  );

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  console.log(`Calculated score: ${finalScore}`);

  return finalScore;
}

function scoreBusinessDensity(points, businessData) {
  if (!points?.length || !businessData?.businessPoints) return 0;
  const radiusMeters = 70;
  let matched = 0;

  points.forEach(pt => {
    const hits = businessData.businessPoints.some(b =>
      getDistance(pt.latitude, pt.longitude, b.latitude, b.longitude) <= radiusMeters
    );
    if (hits) matched += 1;
  });

  return Math.round((matched / points.length) * 100);
}

function scorePopulationDensity(points, populationData) {
  if (!points?.length || !populationData?.populationWays) return 0;
  let matched = 0;

  points.forEach(pt => {
    const hits = populationData.populationWays.some(way => isPointOnWay(pt, way));
    if (hits) matched += 1;
  });

  return Math.round((matched / points.length) * 100);
}

function combineScores(lightingScore, businessScore, populationScore) {
  const wLighting = 0.55;
  const wBusiness = 0.30;
  const wPopulation = 0.15;
  return Math.max(0, Math.min(100, Math.round(
    lightingScore * wLighting + businessScore * wBusiness + populationScore * wPopulation
  )));
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
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationLabel, setLocationLabel] = useState("Current Location"); // display label
  const [businessPopulationData, setBusinessPopulationData] = useState(null);

  // Autocomplete states
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  // Lighting-related states
  const [lightingData, setLightingData] = useState([]);
  const [lightingLoading, setLightingLoading] = useState(false);
  const [lightingCache, setLightingCache] = useState({});

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

      // Fetch street lighting data for the route area
      setLightingLoading(true);
      const routeBounds = calculateRouteBounds(originCoord, destCoord);
      const newLightingData = await fetchStreetLightsInArea(routeBounds);
      setLightingData(newLightingData);

      // Fetch business/population indicators for hybrid scoring
      const businessPopulation = await fetchBusinessAndPopulationData(routeBounds);
      setBusinessPopulationData(businessPopulation);
      setLightingLoading(false);

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
        const segments = segmentRoute(rawPoints, newLightingData);
        const lightingScore = scoreRouteByLighting(segments);
        const businessScore = scoreBusinessDensity(rawPoints, businessPopulation);
        const populationScore = scorePopulationDensity(rawPoints, businessPopulation);
        const combinedScore = combineScores(lightingScore, businessScore, populationScore);

        return {
          segments,
          score: combinedScore,
          lightingScore,
          businessScore,
          populationScore,
          combinedScore,
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

      // Remove duplicates based on route geometry and keep unique alternatives
      const uniqueMap = new Map();
      parsed.forEach(route => {
        const key = route.points.map(pt => `${pt.latitude.toFixed(5)}_${pt.longitude.toFixed(5)}`).join('|');
        if (!uniqueMap.has(key)) uniqueMap.set(key, route);
      });
      const uniqueRoutes = Array.from(uniqueMap.values());

      // Sort by composite safety score and keep top 2 routes
      const scored = uniqueRoutes
        .sort((a, b) => b.combinedScore - a.combinedScore)
        .slice(0, 2);

      setRoutes(scored);
      setSelectedRoute(0);
      fitMapToRoutes(scored);
    } catch (err) {
      console.error("Route fetch error:", err);
      Alert.alert("Error", "Failed to fetch routes. Check your internet connection.");
    }
    setLoading(false);
    setLightingLoading(false);
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
                {(loading || lightingLoading) && <ActivityIndicator color="#3182CE" size="small" />}
              </View>

              <ScrollView
                horizontal
                nestedScrollEnabled
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
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.15,
                        shadowRadius: 12,
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
                      <View style={styles.metaBadge}>
                        <Ionicons name="bar-chart" size={14} color="#64748B" />
                        <Text style={styles.routeMetaText}>L {route.lightingScore} B {route.businessScore} P {route.populationScore}</Text>
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
