import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  useWindowDimensions,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI } from "../services/api";
import { useUser } from "../context/UserContext";

export default function TripDetailsScreen({ navigation, route }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: "", number: "" },
    { name: "", number: "" }
  ]);
  
  const { updateProfile } = useUser();
  const token = route.params?.token;

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return false;
    }
    if (!phone.trim() || phone.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number");
      return false;
    }
    
    // Validate at least one emergency contact
    const validEmergencyContacts = emergencyContacts.filter(
      contact => contact.name.trim() && contact.number.trim() && contact.number.length >= 10
    );
    
    if (validEmergencyContacts.length === 0) {
      Alert.alert("Error", "Please add at least one valid emergency contact");
      return false;
    }

    return true;
  };

  const handleGenerateID = async () => {
    if (validateForm()) {
      console.log('📝 User details completed, saving profile');
      
      const filteredContacts = emergencyContacts.filter(
        contact => contact.name.trim() && contact.number.trim()
      );

      // Removed local saving to AsyncStorage as per requirement to use DB only

      // Save full profile to MongoDB database
      const authToken = token || (await AsyncStorage.getItem('userToken'));
      if (authToken) {
        try {
          const result = await authAPI.updateProfile(authToken, {
            name,
            phone,
            emergencyContacts: filteredContacts,
          });
          
          if (result.user) {
            updateProfile(result.user);
          }
          console.log('✅ Profile saved to database and context:', result?.user?.email);
        } catch (error) {
          console.error('❌ Error saving profile to database:', error.message);
          // Non-fatal: continue to next screen even if DB save fails
        }
      } else {
        console.warn('⚠️ No auth token found, skipping DB save');
      }

      navigation.navigate("MainTabs", {
        screen: "Home",
        params: {
          userData: {
            name,
            phone,
            emergencyContacts: filteredContacts
          },
          setupCompleted: true
        }
      });
    }
  };

  const updateEmergencyContact = (index, field, value) => {
    const updatedContacts = [...emergencyContacts];
    updatedContacts[index] = {
      ...updatedContacts[index],
      [field]: value
    };
    setEmergencyContacts(updatedContacts);
  };

  const addEmergencyContact = () => {
    if (emergencyContacts.length < 4) {
      setEmergencyContacts([...emergencyContacts, { name: "", number: "" }]);
    } else {
      Alert.alert("Maximum Reached", "You can add up to 4 emergency contacts");
    }
  };

  const removeEmergencyContact = (index) => {
    if (emergencyContacts.length > 1) {
      const updatedContacts = emergencyContacts.filter((_, i) => i !== index);
      setEmergencyContacts(updatedContacts);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.title}>Personal Details</Text>
            <View style={styles.placeholder} />
          </View>

          <Text style={styles.subtitle}>
            Complete your profile information for automated emergency alerts
          </Text>

          {/* Personal Information Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                placeholderTextColor="#999"
                maxLength={15}
              />
            </View>
          </View>

          {/* Emergency Contacts Section */}
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Emergency Contacts</Text>
              <Text style={styles.contactCount}>
                {emergencyContacts.filter(c => c.name || c.number).length}/{emergencyContacts.length}
              </Text>
            </View>
            
            <Text style={styles.sectionDescription}>
              Add people to contact in case of emergencies (at least one required)
            </Text>

            {emergencyContacts.map((contact, index) => (
              <View key={index} style={styles.emergencyContactCard}>
                <View style={styles.contactHeader}>
                  <Text style={styles.contactNumber}>Contact {index + 1}</Text>
                  {emergencyContacts.length > 1 && (
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removeEmergencyContact(index)}
                    >
                      <Ionicons name="close-circle" size={20} color="#ff3b30" />
                    </TouchableOpacity>
                  )}
                </View>
                
                <View style={styles.inputRow}>
                  <View style={[styles.inputContainer, styles.contactInput, { flex: 2 }]}>
                    <Ionicons name="person-outline" size={16} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Contact Name"
                      value={contact.name}
                      onChangeText={(value) => updateEmergencyContact(index, 'name', value)}
                      placeholderTextColor="#999"
                    />
                  </View>
                  
                  <View style={[styles.inputContainer, styles.contactInput, { flex: 2 }]}>
                    <Ionicons name="call-outline" size={16} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Phone Number"
                      keyboardType="phone-pad"
                      value={contact.number}
                      onChangeText={(value) => updateEmergencyContact(index, 'number', value)}
                      placeholderTextColor="#999"
                      maxLength={15}
                    />
                  </View>
                </View>
              </View>
            ))}

            {emergencyContacts.length < 4 && (
              <TouchableOpacity 
                style={styles.addContactButton}
                onPress={addEmergencyContact}
              >
                <Ionicons name="add-circle" size={20} color="#3182CE" />
                <Text style={styles.addContactText}>Add Another Contact</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Generate Button */}
          <TouchableOpacity 
            style={[
              styles.generateButton,
              (!name || !phone || !emergencyContacts.some(c => c.name && c.number)) && styles.generateButtonDisabled
            ]} 
            onPress={handleGenerateID}
            disabled={!name || !phone || !emergencyContacts.some(c => c.name && c.number)}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
            <Text style={styles.buttonText}>Complete Profile</Text>
          </TouchableOpacity>

          <Text style={styles.securityNote}>
            <Ionicons name="shield-checkmark" size={14} color="#27AE60" />
            {" "}Your information is encrypted and secure
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  placeholder: {
    width: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F172A",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 22,
  },
  formSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
  },
  contactCount: {
    fontSize: 14,
    color: "#3182CE",
    fontWeight: "600",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    width: "100%",
    fontSize: 16,
    color: "#0F172A",
  },
  emergencyContactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  removeButton: {
    padding: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  contactInput: {
    flex: 1,
    marginBottom: 0,
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#3182CE',
    borderStyle: 'dashed',
  },
  addContactText: {
    color: "#3182CE",
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 8,
  },
  generateButton: {
    backgroundColor: "#0F172A",
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  generateButtonDisabled: {
    backgroundColor: "#ccc",
    boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.1)",
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    marginLeft: 10,
  },
  securityNote: {
    fontSize: 14,
    color: "#27AE60",
    textAlign: "center",
    fontWeight: "500",
  },
});