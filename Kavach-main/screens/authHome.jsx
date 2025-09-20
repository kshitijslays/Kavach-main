import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

const alertSound = require("../assets/alarm.mp3");

// Enhanced mock data
const initialAlerts = [
  {
    id: "1",
    name: "Om Sharma",
    type: "SOS",
    location: "SOS: Near Amer Fort, Jaipur",
    time: "Just now",
    status: "active",
    priority: "high",
  },
  {
    id: "2",
    name: "John Smith",
    type: "Anomaly",
    location: "Anomaly: Prolonged Stop near Jal Mahal",
    time: "15 mins ago",
    status: "in-progress",
    priority: "medium",
  },
  {
    id: "3",
    name: "Aarav Patel",
    type: "Anomaly",
    location: "Anomaly: Route Deviation near Nahargarh",
    time: "25 mins ago",
    status: "resolved",
    priority: "medium",
  },
  {
    id: "4",
    name: "Walter White",
    type: "Anomaly",
    location: "Anomaly: Route Deviation near Hawa Mahal",
    time: "48 mins ago",
    status: "resolved",
    priority: "low",
  },
];

const mockStats = {
  activeTourists: 1254,
  officersOnDuty: 45,
  casesResolved: 31,
  safeZones: 15,
  alertsToday: 4,
};

const verifiedTourist = {
  name: "Kenji Tanaka",
  nationality: "Japan",
  passport: "FR12345XYZ",
  tripEnd: "20 Sep 2025",
  imageUrl: "https://randomuser.me/api/portraits/men/3.jpg",
  verifiedAt: "Today, 10:23 AM",
};

const mockTourists = [
  {
    id: "101",
    name: "Michael Scott",
    nationality: "USA",
    imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    status: "verified",
    lastLocation: "City Palace",
  },
  {
    id: "102",
    name: "Laura Palmer",
    nationality: "Canada",
    imageUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "pending",
    lastLocation: "Jal Mahal",
  },
  {
    id: "103",
    name: "Chloe Dubois",
    nationality: "France",
    imageUrl: "https://randomuser.me/api/portraits/women/41.jpg",
    status: "verified",
    lastLocation: "Hawa Mahal",
  },
  {
    id: "104",
    name: "Isabella Rossi",
    nationality: "Italy",
    imageUrl: "https://randomuser.me/api/portraits/women/22.jpg",
    status: "verified",
    lastLocation: "Albert Hall Museum",
  },
  {
    id: "105",
    name: "Liam Murphy",
    nationality: "Ireland",
    imageUrl: "https://randomuser.me/api/portraits/men/9.jpg",
    status: "needs-attention",
    lastLocation: "Nahargarh Fort",
  },
];

// New Components
const AlertPriorityBadge = ({ priority }) => {
  const getPriorityColor = () => {
    switch (priority) {
      case "high":
        return "#DC3545";
      case "medium":
        return "#FFC107";
      case "low":
        return "#6C757D";
      default:
        return "#6C757D";
    }
  };

  const getPriorityText = () => {
    switch (priority) {
      case "high":
        return "High";
      case "medium":
        return "Medium";
      case "low":
        return "Low";
      default:
        return "Unknown";
    }
  };

  return (
    <View
      style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}
    >
      <Text style={styles.priorityText}>{getPriorityText()}</Text>
    </View>
  );
};
 
const AlertStatusIndicator = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "#DC3545";
      case "in-progress":
        return "#17A2B8";
      case "resolved":
        return "#28A745";
      default:
        return "#6C757D";
    }
  };

  return (
    <View
      style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}
    />
  );
};

const SearchBar = ({ value, onChangeText, placeholder }) => {
  return (
    <View style={styles.searchContainer}>
      <Ionicons
        name="search"
        size={20}
        color="#6C757D"
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#6C757D"
      />
    </View>
  );
};

const FilterButton = ({ title, active, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterButtonText,
          active && styles.filterButtonTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// Enhanced ScannerModal with torch functionality
const ScannerModal = ({ visible, onClose, onCaptureSuccess }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const scannerLineAnim = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef(null);

  useEffect(() => {
    if (visible) {
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
    }
  }, [visible, scannerLineAnim]);

  const handleCapture = () => {
    onCaptureSuccess();
  };

  const toggleTorch = () => {
    setTorchEnabled((prev) => !prev);
  };

  if (!visible) return null;
  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <Modal visible={visible} onRequestClose={onClose}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-off" size={48} color="#6C757D" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionMessage}>
            We need access to your camera to scan tourist digital IDs
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.scannerContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing={"back"}
          ref={cameraRef}
          torchEnabled={torchEnabled}
        />
        <View style={styles.overlay}>
          <View style={styles.scannerHeader}>
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.scannerTitle}>Scan Tourist Digital ID</Text>
            <TouchableOpacity style={styles.torchButton} onPress={toggleTorch}>
              <Ionicons
                name={torchEnabled ? "flashlight" : "flashlight-outline"}
                size={28}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.scannerBox}>
            <Animated.View
              style={[
                styles.scannerLine,
                { transform: [{ translateY: scannerLineAnim }] },
              ]}
            />
            <View style={styles.scannerCornerTL} />
            <View style={styles.scannerCornerTR} />
            <View style={styles.scannerCornerBL} />
            <View style={styles.scannerCornerBR} />
          </View>

          <Text style={styles.scannerHint}>
            Position the QR code within the frame to scan
          </Text>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
          >
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.captureButtonText}>Capture & Verify</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Enhanced VerifiedTouristModal with more details
const VerifiedTouristModal = ({ visible, onClose, tourist }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.verifiedContainer}>
          <View style={styles.verifiedHeader}>
            <View style={styles.verifiedTitleContainer}>
              <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
              <Text style={styles.verifiedTitle}>Verification Successful</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#6C757D" />
            </TouchableOpacity>
          </View>

          <View style={styles.idCard}>
            <View style={styles.idCardHeader}>
              <Image
                source={require("../assets/government-logo.png")} // Add your government logo
                style={styles.govLogo}
                resizeMode="contain"
              />
              <Text style={styles.idCardHeaderText}>
                Suraksha Kavach Digital ID
              </Text>
            </View>

            <View style={styles.idCardBody}>
              <Image
                source={{ uri: tourist.imageUrl }}
                style={styles.profilePic}
              />

              <View style={styles.touristInfo}>
                <Text style={styles.touristName}>{tourist.name}</Text>
                <Text style={styles.touristNationality}>
                  {tourist.nationality}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.idDetails}>
                <View style={styles.idDetailsRow}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="document-text" size={16} color="#6C757D" />
                  </View>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Passport No.</Text>
                    <Text style={styles.detailValue}>{tourist.passport}</Text>
                  </View>
                </View>

                <View style={styles.idDetailsRow}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="calendar" size={16} color="#6C757D" />
                  </View>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Valid Until</Text>
                    <Text style={styles.detailValue}>{tourist.tripEnd}</Text>
                  </View>
                </View>

                <View style={styles.idDetailsRow}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="time" size={16} color="#6C757D" />
                  </View>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Verified At</Text>
                    <Text style={styles.detailValue}>{tourist.verifiedAt}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.verifiedText}>GENUINE TRAVELER</Text>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton}>
              <Ionicons name="navigate" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Enhanced TouristsListModal with search and filter
const TouristsListModal = ({ visible, onClose, tourists }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const filteredTourists = tourists.filter((tourist) => {
    const matchesSearch =
      tourist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tourist.nationality.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "verified")
      return matchesSearch && tourist.status === "verified";
    if (activeFilter === "pending")
      return matchesSearch && tourist.status === "pending";
    if (activeFilter === "attention")
      return matchesSearch && tourist.status === "needs-attention";

    return matchesSearch;
  });

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Active Tourists</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search tourists by name or nationality"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          <FilterButton
            title="All"
            active={activeFilter === "all"}
            onPress={() => setActiveFilter("all")}
          />
          <FilterButton
            title="Verified"
            active={activeFilter === "verified"}
            onPress={() => setActiveFilter("verified")}
          />
          <FilterButton
            title="Pending"
            active={activeFilter === "pending"}
            onPress={() => setActiveFilter("pending")}
          />
          <FilterButton
            title="Needs Attention"
            active={activeFilter === "attention"}
            onPress={() => setActiveFilter("attention")}
          />
        </ScrollView>

        <FlatList
          data={filteredTourists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.touristListItem}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.touristListImage}
              />
              <View style={styles.touristListInfo}>
                <Text style={styles.touristNameLarge}>{item.name}</Text>
                <View style={styles.touristMeta}>
                  <Text style={styles.touristDetail}>{item.nationality}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      item.status === "verified" && styles.statusVerified,
                      item.status === "pending" && styles.statusPending,
                      item.status === "needs-attention" &&
                        styles.statusAttention,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {item.status === "verified"
                        ? "Verified"
                        : item.status === "pending"
                          ? "Pending"
                          : "Needs Attention"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.touristLocation}>{item.lastLocation}</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={24} color="#667085" />
              </TouchableOpacity>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#03474f"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#DEE2E6" />
              <Text style={styles.emptyStateText}>No tourists found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search or filter criteria
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
};

// Settings Modal
const SettingsModal = ({ visible, onClose }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.settingsContainer}>
        <View style={styles.settingsHeader}>
          <Text style={styles.settingsTitle}>Settings</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.settingsContent}>
          <Text style={styles.settingsSectionTitle}>Preferences</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={22} color="#03474f" />
              <View style={styles.settingText}>
                <Text style={styles.settingName}>Push Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive alert notifications
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#DEE2E6", true: "#03474f" }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="finger-print" size={22} color="#03474f" />
              <View style={styles.settingText}>
                <Text style={styles.settingName}>Biometric Login</Text>
                <Text style={styles.settingDescription}>
                  Use fingerprint or face recognition
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: "#DEE2E6", true: "#03474f" }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="refresh" size={22} color="#03474f" />
              <View style={styles.settingText}>
                <Text style={styles.settingName}>Auto Refresh</Text>
                <Text style={styles.settingDescription}>
                  Automatically refresh data
                </Text>
              </View>
            </View>
            <Switch
              value={autoRefresh}
              onValueChange={setAutoRefresh}
              trackColor={{ false: "#DEE2E6", true: "#03474f" }}
            />
          </View>

          <Text style={styles.settingsSectionTitle}>About</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="document-text" size={22} color="#03474f" />
              <View style={styles.settingText}>
                <Text style={styles.settingName}>Privacy Policy</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6C757D" />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield-checkmark" size={22} color="#03474f" />
              <View style={styles.settingText}>
                <Text style={styles.settingName}>Terms of Service</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6C757D" />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="information-circle" size={22} color="#03474f" />
              <View style={styles.settingText}>
                <Text style={styles.settingName}>App Version</Text>
                <Text style={styles.settingDescription}>1.2.0 (Build 45)</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out" size={20} color="#DC3545" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

export default function AuthorityHomeScreen({ route, navigation }) {
  const { officialId } = route.params || {};
  const officerName = officialId || "Officer";
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState(initialAlerts);
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [isVerifiedModalVisible, setIsVerifiedModalVisible] = useState(false);
  const [isTouristsListVisible, setIsTouristsListVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const vibrationInterval = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const soundObject = useRef(null);

  useEffect(() => {
    if (isAlertVisible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isAlertVisible, pulseAnim]);

  async function triggerAlert() {
    vibrationInterval.current = setInterval(() => {
      Vibration.vibrate(500);
    }, 1000);
    try {
      const { sound } = await Audio.Sound.createAsync(alertSound);
      soundObject.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.log("Error playing sound:", error);
    }
    setIsAlertVisible(true);
  }

  const handleStopAlerts = () => {
    clearInterval(vibrationInterval.current);
    if (soundObject.current) {
      soundObject.current.stopAsync();
      soundObject.current.unloadAsync();
    }
    const newAlert = {
      id: "1",
      name: "Ananya Singh",
      type: "SOS",
      location: "SOS: Near Amer Fort, Jaipur",
      time: "Just now",
      status: "active",
      priority: "high",
    };
    setLiveAlerts([newAlert, ...liveAlerts]);
    setIsAlertVisible(false);
  };

  useEffect(() => {
    const timer = setTimeout(triggerAlert, 20000);
    return () => {
      clearTimeout(timer);
      clearInterval(vibrationInterval.current);
    };
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const handleCaptureSuccess = () => {
    setIsScannerVisible(false);
    setIsVerifiedModalVisible(true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const markAlertAsResolved = (alertId) => {
    setLiveAlerts((alerts) =>
      alerts.map((alert) =>
        alert.id === alertId ? { ...alert, status: "resolved" } : alert
      )
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isAlertVisible}
        onRequestClose={handleStopAlerts}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Ionicons name="alert-circle" size={60} color="#DC3545" />
            </Animated.View>
            <Text style={styles.modalTitle}>SOS Alert Received!</Text>
            <Text style={styles.modalText}>
              Tourist <Text style={{ fontWeight: "bold" }}>Ananya Singh</Text>{" "}
              has pressed the SOS button near{" "}
              <Text style={{ fontWeight: "bold" }}>Amer Fort, Jaipur.</Text>
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.trackButton]}
                onPress={handleStopAlerts}
              >
                <Ionicons name="navigate-outline" size={20} color="#fff" />
                <Text style={styles.modalButtonText}>Track Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleStopAlerts}
              >
                <Ionicons name="location-outline" size={20} color="#fff" />
                <Text style={styles.modalButtonText}>Live Location</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleStopAlerts}
              >
                <Ionicons name="call-outline" size={20} color="#fff" />
                <Text style={styles.modalButtonText}>Call</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleStopAlerts}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScannerModal
        visible={isScannerVisible}
        onClose={() => setIsScannerVisible(false)}
        onCaptureSuccess={handleCaptureSuccess}
      />

      <VerifiedTouristModal
        visible={isVerifiedModalVisible}
        onClose={() => setIsVerifiedModalVisible(false)}
        tourist={verifiedTourist}
      />

      <TouristsListModal
        visible={isTouristsListVisible}
        onClose={() => setIsTouristsListVisible(false)}
        tourists={mockTourists}
      />

      <SettingsModal
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#03474f"]}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerWelcome}>Welcome Back,</Text>
            <Text style={styles.headerTitle}>{officerName}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="notifications-outline" size={24} color="#333" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>3</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setIsSettingsVisible(true)}
            >
              <Ionicons name="settings-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.statsScroller}
        >
          <StatCard
            title="Active Tourists"
            value={mockStats.activeTourists}
            icon="people"
            color="#03474f"
          />
          <StatCard
            title="Active Alerts"
            value={liveAlerts.length}
            icon="alert"
            color="#DC3545"
          />
          <StatCard
            title="Officers on Duty"
            value={mockStats.officersOnDuty}
            icon="shield-checkmark"
            color="#28A745"
          />
          <StatCard
            title="Cases Resolved"
            value={mockStats.casesResolved}
            icon="checkmark-done"
            color="#6C757D"
          />
          <StatCard
            title="Safe Zones"
            value={mockStats.safeZones}
            icon="location"
            color="#FFC107"
          />
        </ScrollView>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live Alerts</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={liveAlerts}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.alertCard,
                  {
                    borderLeftWidth: 4,
                    borderLeftColor:
                      item.type === "SOS" ? "#DC3545" : "#FFC107",
                  },
                ]}
              >
                <AlertStatusIndicator status={item.status} />
                <View style={styles.alertInfo}>
                  <View style={styles.alertHeader}>
                    <Text style={styles.alertName}>{item.name}</Text>
                    <AlertPriorityBadge priority={item.priority} />
                  </View>
                  <Text style={styles.alertLocation}>{item.location}</Text>
                  <Text style={styles.alertTime}>{item.time}</Text>
                </View>
                <View style={styles.alertActions}>
                  {item.status !== "resolved" && (
                    <TouchableOpacity
                      style={styles.resolveButton}
                      onPress={() => markAlertAsResolved(item.id)}
                    >
                      <Ionicons name="checkmark" size={16} color="#28A745" />
                      <Text style={styles.resolveButtonText}>Resolve</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.alertMenuButton}>
                    <Ionicons
                      name="ellipsis-vertical"
                      size={20}
                      color="#6C757D"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyAlerts}>
                <Ionicons
                  name="checkmark-done-circle"
                  size={48}
                  color="#DEE2E6"
                />
                <Text style={styles.emptyAlertsText}>No active alerts</Text>
                <Text style={styles.emptyAlertsSubtext}>
                  All cases are resolved
                </Text>
              </View>
            }
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                Alert.alert(
                  "Feature Unavailable",
                  "The live map is currently in development."
                )
              }
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: "rgba(0, 123, 255, 0.1)" },
                ]}
              >
                <Ionicons name="map-outline" size={24} color="#03474f" />
              </View>
              <Text style={styles.actionTitle}>Live Map</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setIsScannerVisible(true)}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: "rgba(0, 123, 255, 0.1)" },
                ]}
              >
                <Ionicons name="qr-code-outline" size={24} color="#03474f" />
              </View>
              <Text style={styles.actionTitle}>Scan Tourist ID</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setIsTouristsListVisible(true)}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: "rgba(0, 123, 255, 0.1)" },
                ]}
              >
                <Ionicons name="people-outline" size={24} color="##03474f" />
              </View>
              <Text style={styles.actionTitle}>View All Tourists</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                Alert.alert(
                  "Feature Unavailable",
                  "Automated report generation is coming soon."
                )
              }
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: "rgba(0, 123, 255, 0.1)" },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color="#03474f"
                />
              </View>
              <Text style={styles.actionTitle}>Generate Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Verified</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View History</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.touristCard}>
            <Image
              source={{ uri: verifiedTourist.imageUrl }}
              style={styles.touristImage}
            />
            <View style={styles.touristInfo}>
              <Text style={styles.touristNameLarge}>
                {verifiedTourist.name}
              </Text>
              <Text style={styles.touristDetail}>
                Passport: {verifiedTourist.passport}
              </Text>
              <Text style={styles.touristTime}>
                Verified: {verifiedTourist.verifiedAt}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#667085" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerWelcome: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1D2939",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
    marginLeft: 12,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#DC3545",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  statsScroller: {
    marginBottom: 24,
  },
  statCard: {
    width: 160,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statTitle: {
    fontSize: 14,
    color: "#6C757D",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1D2939",
  },
  viewAllText: {
    fontSize: 14,
    color: "#03474f",
    fontWeight: "500",
  },
  alertCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  alertName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1D2939",
    marginRight: 8,
  },
  alertLocation: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: "#6C757D",
  },
  alertActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  resolveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(40, 167, 69, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  resolveButtonText: {
    color: "#28A745",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  alertMenuButton: {
    padding: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  emptyAlerts: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyAlertsText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6C757D",
    marginTop: 12,
  },
  emptyAlertsSubtext: {
    fontSize: 14,
    color: "#ADB5BD",
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "48%",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1D2939",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 12,
    textAlign: "center",
    color: "#1D2939",
  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 22,
    color: "#6C757D",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  modalButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#03474f",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  trackButton: {
    backgroundColor: "#DC3545",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "500",
    marginLeft: 5,
    fontSize: 12,
  },
  dismissText: {
    marginTop: 10,
    color: "#6C757D",
    fontSize: 16,
    fontWeight: "500",
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  scannerHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
  },
  backButton: {
    padding: 8,
  },
  scannerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  torchButton: {
    padding: 8,
  },
  scannerBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#03474f",
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  scannerLine: {
    width: "100%",
    height: 2,
    backgroundColor: "#03474f",
    shadowColor: "#03474f",
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  scannerCornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#03474f",
  },
  scannerCornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "#03474f",
  },
  scannerCornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#03474f",
  },
  scannerCornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "#03474f",
  },
  scannerHint: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  captureButton: {
    backgroundColor: "#03474f",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginBottom: 40,
  },
  captureButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1D2939",
    marginTop: 16,
    marginBottom: 8,
  },
  permissionMessage: {
    fontSize: 16,
    color: "#6C757D",
    textAlign: "center",
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: "#03474f",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  verifiedContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
    overflow: "hidden",
  },
  verifiedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  verifiedTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifiedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1D2939",
    marginLeft: 8,
  },
  idCard: {
    padding: 24,
    alignItems: "center",
  },
  idCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  govLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  idCardHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1D2939",
  },
  idCardBody: {
    width: "100%",
    alignItems: "center",
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#03474f",
    marginBottom: 16,
  },
  touristInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  touristName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1D2939",
    marginBottom: 4,
  },
  touristNationality: {
    fontSize: 16,
    color: "#6C757D",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#E9ECEF",
    marginBottom: 20,
  },
  idDetails: {
    width: "100%",
  },
  idDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  detailIconContainer: {
    width: 32,
    alignItems: "center",
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1D2939",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28A745",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 16,
  },
  verifiedText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 8,
    marginRight: 12,
  },
  secondaryButtonText: {
    color: "#6C757D",
    fontWeight: "500",
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#03474f",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 8,
  },
  touristCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  touristImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  touristInfo: {
    flex: 1,
  },
  touristNameLarge: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1D2939",
    marginBottom: 4,
  },
  touristDetail: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 2,
  },
  touristTime: {
    fontSize: 12,
    color: "#ADB5BD",
  },
  listContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    backgroundColor: "#fff",
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1D2939",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1D2939",
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#03474f",
    borderColor: "#03474f",
  },
  filterButtonText: {
    color: "#6C757D",
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  touristListItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  touristListImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  touristListInfo: {
    flex: 1,
  },
  touristMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusVerified: {
    backgroundColor: "rgba(40, 167, 69, 0.1)",
  },
  statusPending: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
  },
  statusAttention: {
    backgroundColor: "rgba(220, 53, 69, 0.1)",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "500",
  },
  statusVerifiedText: {
    color: "#28A745",
  },
  statusPendingText: {
    color: "#FFC107",
  },
  statusAttentionText: {
    color: "#DC3545",
  },
  touristLocation: {
    fontSize: 12,
    color: "#ADB5BD",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6C757D",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#ADB5BD",
    marginTop: 4,
    textAlign: "center",
  },
  settingsContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  settingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    backgroundColor: "#fff",
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1D2939",
  },
  settingsContent: {
    flex: 1,
    padding: 16,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D2939",
    marginTop: 16,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    marginLeft: 16,
  },
  settingName: {
    fontSize: 16,
    color: "#1D2939",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: "#6C757D",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  logoutButtonText: {
    color: "#DC3545",
    fontWeight: "500",
    marginLeft: 8,
  },
});
