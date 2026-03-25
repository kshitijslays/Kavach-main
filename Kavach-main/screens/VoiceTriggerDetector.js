import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import { Platform } from "react-native";
import { Audio } from "expo-av";

// Dynamically load @react-native-voice/voice so the app doesn't crash in Expo Go
// (native module not included in Expo Go). Voice will be null → keyword detection
// is skipped automatically; scream detection via expo-av still works.
let Voice = null;
try {
  Voice = require("@react-native-voice/voice").default;
} catch (_) {
  console.warn(
    "VoiceTrigger: @react-native-voice/voice not available (Expo Go). " +
    "Keyword detection disabled. Scream detection is active."
  );
}

// ----- CONFIGURATION -----
const DISTRESS_KEYWORDS = [
  "help", "help me", "please help", "please help me",
  "save me", "someone help", "emergency", "danger",
  "bachao", "madad karo", "bachao mujhe", "please save me", "i need help",
];

// Metering threshold in dB. Typical speech -30 to -15 dB; scream > -10 dB.
const SCREAM_DB_THRESHOLD = -10;
const METERING_POLL_INTERVAL = 500;
const TRIGGER_COOLDOWN_MS = 45000;
const VOICE_SESSION_DURATION = 5000;
// How long to wait after a recording failure before retrying (ms)
const RECORDING_RETRY_DELAY = 10000;

const VoiceTriggerDetector = forwardRef(function VoiceTriggerDetector({ onTrigger, enabled = true }, ref) {
  const lastTriggerRef = useRef(0);
  const voiceRestartTimerRef = useRef(null);
  const screamRecordingRef = useRef(null);
  const screamTimerRef = useRef(null);
  const isVoiceListeningRef = useRef(false);
  const isDestroyedRef = useRef(false);

  // ─── KEY FIX: store onTrigger in a ref so callbacks are stable ───────────
  // This prevents the scream/keyword effects from re-running every time the
  // parent re-renders with a new function reference (e.g. after user loads).
  const onTriggerRef = useRef(onTrigger);
  useEffect(() => { onTriggerRef.current = onTrigger; }, [onTrigger]);

  // ── Expose stopScreamDetector() to parent via ref ─────────────────────────
  useImperativeHandle(ref, () => ({
    stopScreamDetector: () => {
      console.log("🎤 VoiceTrigger: stopping scream detector for emergency recording");
      clearTimeout(screamTimerRef.current);
      const rec = screamRecordingRef.current;
      if (rec) {
        screamRecordingRef.current = null;
        rec.stopAndUnloadAsync().catch(() => {});
      }
    },
  }));

  // ── Shared cooldown guard (stable — no deps on onTrigger) ─────────────────
  const fireIfCooledDown = useCallback((reason) => {
    const now = Date.now();
    if (now - lastTriggerRef.current < TRIGGER_COOLDOWN_MS) {
      console.log(`⏳ Voice trigger suppressed (cooldown): ${reason}`);
      return;
    }
    lastTriggerRef.current = now;
    console.log(`🚨 Voice trigger FIRED: ${reason}`);
    onTriggerRef.current?.(reason);   // call via ref — always fresh
  }, []); // ← empty deps: this callback is now permanently stable

  // ── KEYWORD DETECTION ─────────────────────────────────────────────────────
  const startVoiceListening = useCallback(async () => {
    if (!Voice || Platform.OS === "web" || isDestroyedRef.current) return;
    if (isVoiceListeningRef.current) return;
    try {
      isVoiceListeningRef.current = true;
      await Voice.start("en-US");
      console.log("🎙️ VoiceTrigger: keyword listener started");
    } catch (err) {
      isVoiceListeningRef.current = false;
      console.warn("VoiceTrigger: voice start error:", err.message);
      voiceRestartTimerRef.current = setTimeout(startVoiceListening, 3000);
    }
  }, []); // stable

  const scheduleVoiceRestart = useCallback(() => {
    if (!Voice || isDestroyedRef.current) return;
    voiceRestartTimerRef.current = setTimeout(async () => {
      try {
        if (isVoiceListeningRef.current) {
          await Voice.stop();
          isVoiceListeningRef.current = false;
        }
      } catch (_) {}
      startVoiceListening();
    }, VOICE_SESSION_DURATION);
  }, [startVoiceListening]);

  useEffect(() => {
    if (Platform.OS === "web" || !enabled) return;
    if (!Voice) {
      console.log("🎙️ VoiceTrigger: keyword detection skipped (scream-only mode)");
      return;
    }

    Voice.onSpeechResults = (event) => {
      const transcripts = event?.value ?? [];
      transcripts.forEach((t) => {
        const lower = t.toLowerCase().trim();
        console.log(`🎙️ VoiceTrigger heard: "${lower}"`);
        if (DISTRESS_KEYWORDS.some((kw) => lower.includes(kw))) {
          fireIfCooledDown(`distress keyword: "${lower}"`);
        }
      });
      isVoiceListeningRef.current = false;
      scheduleVoiceRestart();
    };

    Voice.onSpeechError = (err) => {
      console.warn("VoiceTrigger: speech error:", err?.error?.message);
      isVoiceListeningRef.current = false;
      scheduleVoiceRestart();
    };

    Voice.onSpeechEnd = () => {
      isVoiceListeningRef.current = false;
      scheduleVoiceRestart();
    };

    (async () => {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status !== "granted") {
        console.warn("VoiceTrigger: microphone permission denied");
        return;
      }
      startVoiceListening();
    })();

    return () => {
      isDestroyedRef.current = true;
      clearTimeout(voiceRestartTimerRef.current);
      Voice.destroy().then(Voice.removeAllListeners).catch(() => {});
    };
  // ← Only runs on mount/unmount since all deps are stable
  }, [enabled, startVoiceListening, scheduleVoiceRestart, fireIfCooledDown]);

  // ── SCREAM DETECTION ──────────────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS === "web" || !enabled) return;

    let isEffectActive = true; // local flag for this effect instance

    const startScreamDetection = async () => {
      try {
        const perm = await Audio.requestPermissionsAsync();
        if (perm.status !== "granted") return;

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        // If another recording is already active (e.g. emergency recording),
        // wait and retry rather than crashing.
        let rec;
        try {
          const result = await Audio.Recording.createAsync({
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
            isMeteringEnabled: true,
          });
          rec = result.recording;
        } catch (recErr) {
          console.warn("VoiceTrigger: recording conflict, retrying in 10s:", recErr.message);
          if (isEffectActive) {
            screamTimerRef.current = setTimeout(startScreamDetection, RECORDING_RETRY_DELAY);
          }
          return;
        }

        if (!isEffectActive) {
          // Effect was cleaned up while we were awaiting — stop immediately
          await rec.stopAndUnloadAsync().catch(() => {});
          return;
        }

        screamRecordingRef.current = rec;
        console.log("📢 VoiceTrigger: scream detector started");

        const poll = async () => {
          if (!isEffectActive || !screamRecordingRef.current) return;
          try {
            const status = await screamRecordingRef.current.getStatusAsync();
            if (status.isRecording && status.metering !== undefined) {
              if (status.metering > SCREAM_DB_THRESHOLD) {
                console.log(`📢 Loud sound detected! dB: ${status.metering.toFixed(1)}`);
                fireIfCooledDown(`loud sound (${status.metering.toFixed(1)} dB)`);
              }
            }
          } catch (_) {}
          if (isEffectActive) {
            screamTimerRef.current = setTimeout(poll, METERING_POLL_INTERVAL);
          }
        };

        screamTimerRef.current = setTimeout(poll, METERING_POLL_INTERVAL);
      } catch (err) {
        console.warn("VoiceTrigger: scream detector error:", err.message);
      }
    };

    startScreamDetection();

    return () => {
      isEffectActive = false;
      clearTimeout(screamTimerRef.current);
      // Stop and release the recording synchronously via the ref
      const rec = screamRecordingRef.current;
      if (rec) {
        screamRecordingRef.current = null;
        rec.stopAndUnloadAsync().catch(() => {});
      }
    };
  // ← Only runs on mount/unmount — fireIfCooledDown is stable
  }, [enabled, fireIfCooledDown]);

  return null;
});

export default VoiceTriggerDetector;
