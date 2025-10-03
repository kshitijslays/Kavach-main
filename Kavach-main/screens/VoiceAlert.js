import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import Voice from "@react-native-voice/voice";

export default function VoiceAlert() {
  const [listening, setListening] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    // Handle speech results
    Voice.onSpeechResults = (event) => {
      const transcript = event.value[0].toLowerCase();
      console.log("Heard:", transcript);

      const keywords = ["help", "save me", "bachao", "madad"];

      if (keywords.some((word) => transcript.includes(word))) {
        setAlertMessage("🚨 Alert Sent! Authorities Notified.");
        // TODO: Send alert to backend (API call)
      }
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      await Voice.start("en-US");
      setListening(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setListening(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Safety Alert</Text>
      <Text>Status: {listening ? "🎙️ Listening..." : "❌ Not Listening"}</Text>
      {alertMessage ? (
        <Text style={styles.alert}>{alertMessage}</Text>
      ) : null}
      <Button
        title={listening ? "Stop Listening" : "Start Listening"}
        onPress={listening ? stopListening : startListening}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  alert: { marginTop: 20, fontSize: 18, color: "red", fontWeight: "bold" },
});
