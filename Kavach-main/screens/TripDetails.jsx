import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';

// Import the DigitalId component
import DigitalId from "./DigitalId";

export default function TripDetailsScreen({ navigation }) {
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyNumber, setEmergencyNumber] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [destination, setDestination] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const validateForm = () => {
    if (!emergencyName.trim()) {
      Alert.alert("Error", "Please enter emergency contact name");
      return false;
    }
    if (!emergencyNumber.trim() || emergencyNumber.length < 10) {
      Alert.alert("Error", "Please enter a valid emergency contact number");
      return false;
    }
    if (!destination.trim()) {
      Alert.alert("Error", "Please enter your destination");
      return false;
    }
    return true;
  };

  const handleGenerateID = () => {
    if (validateForm()) {
      navigation.navigate("DigitalID", {
        tripData: {
          emergencyName,
          emergencyNumber,
          startDate,
          endDate,
          destination
        }
      });
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#03474f" />
          </TouchableOpacity>

          <Text style={styles.title}>Trip Details</Text>
          <Text style={styles.subtitle}>Please fill in your travel information</Text>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Emergency Contact Name"
                value={emergencyName}
                onChangeText={setEmergencyName}
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Emergency Contact Number"
                keyboardType="phone-pad"
                value={emergencyNumber}
                onChangeText={setEmergencyNumber}
                placeholderTextColor="#666"
                maxLength={15}
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Trip Information</Text>
            
            <TouchableOpacity 
              style={styles.dateContainer}
              onPress={() => setShowStartPicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
              <Text style={styles.dateText}>Start: {formatDate(startDate)}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dateContainer}
              onPress={() => setShowEndPicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
              <Text style={styles.dateText}>End: {formatDate(endDate)}</Text>
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Destination"
                value={destination}
                onChangeText={setDestination}
                placeholderTextColor="#666"
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.generateButton} 
            onPress={handleGenerateID} // Updated to use the handleGenerateID function
          >
            <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Generate Digital ID</Text>
          </TouchableOpacity>

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowStartPicker(false);
                if (date) setStartDate(date);
              }}
              minimumDate={new Date()}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowEndPicker(false);
                if (date) setEndDate(date);
              }}
              minimumDate={startDate}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#03474f",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#03474f",
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  generateButton: {
    backgroundColor: "#03474f",
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});