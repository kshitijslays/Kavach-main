import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AuthorityLoginScreen({ navigation }) {
  const [officialId, setOfficialId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (officialId.length >= 8 && password.length >= 8) {
      // This logic correctly navigates and passes the ID
      navigation.navigate("authHome", { officialId: officialId });
    } else {
      Alert.alert(
        "Login Failed",
        "Official ID and Password must be at least 8 characters long."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#03474f" />
          </TouchableOpacity>
          <Text style={styles.title}>Authority Login</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Official ID</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your official ID"
                placeholderTextColor="#999"
                value={officialId}
                onChangeText={setOfficialId}
              />
            </View>
          </View>

          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <Ionicons name="eye-off-outline" size={20} color="#999" />
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.helpSection}>
          <Text style={styles.helpText}>
            Restricted access. Authorized personnel only.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  backButton: { padding: 5 },
  placeholder: { width: 24 },
  title: { fontSize: 22, fontWeight: "bold", color: "#03474f" },
  formContainer: { flex: 1 },
  inputField: { marginBottom: 25 },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#03474f",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  input: { flex: 1, fontSize: 16, color: "#333", paddingVertical: 15 },
  primaryButton: {
    backgroundColor: "#03474f",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  linkText: {
    fontSize: 14,
    color: "#03474f",
    textAlign: "center",
    fontWeight: "600",
  },
  helpSection: {
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  helpText: { fontSize: 12, color: "#999", textAlign: "center" },
});