import User from "../models/userModel.js";
import { sendMail } from "../utils/sendMail.js";
import twilio from "twilio";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Twilio Client Initialization
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER; // e.g., 'whatsapp:+14155238886'

let client;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
  console.log("📟 Twilio Client initialized for automated alerts.");
} else {
  console.log("⚠️ Twilio credentials missing - automated alerts will be disabled.");
}

export const triggerEmergencyAlert = async (req, res) => {
  const { userId, location, message, contacts } = req.body;

  if (!location || !contacts || contacts.length === 0) {
    return res.status(400).json({ message: "Invalid emergency data" });
  }

  // Helper to ensure E.164 format (best effort)
  const formatToE164 = (num) => {
    const clean = num.replace(/[^\d+]/g, '');
    // If it's a 10-digit number without a +, assume India (+91)
    if (clean.length === 10 && !clean.startsWith('+')) {
      return `+91${clean}`;
    }
    // If it doesn't start with +, prepend + assuming it's already got a country code prefix
    return clean.startsWith('+') ? clean : `+${clean}`;
  };

  try {
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    const fullMessage = `${message || "🚨 EMERGENCY ALERT: I may be in danger. Please check on me immediately."}\n\nMy Live Location: ${mapsLink}`;

    console.log(`\n🚨 === TWILIO EMERGENCY TRIGGERED ===`);
    console.log(`📍 Location: ${location.latitude}, ${location.longitude}`);
    console.log(`📱 Alerting ${contacts.length} contacts via Twilio...`);

    // Fallback initialization if first one failed (common in ES modules)
    if (!client && accountSid && authToken) {
      console.log("📟 Retrying Twilio initialization...");
      client = twilio(accountSid, authToken);
    }

    if (!client) {
      console.error("❌ Twilio client not initialized. Check your .env file.");
      return res.status(500).json({ message: "Twilio credentials missing in backend" });
    }

    const results = [];

    // 1. Loop through contacts for SMS and WhatsApp
    for (const contact of contacts) {
      const e164Number = formatToE164(contact.number);
      
      // SMS
      try {
        const sms = await client.messages.create({
          body: fullMessage,
          from: twilioNumber,
          to: e164Number
        });
        results.push({ type: 'SMS', contact: contact.name, status: 'success', sid: sms.sid });
        console.log(`   ✅ [SMS] Sent to ${contact.name} (${e164Number}): ${sms.sid}`);
      } catch (err) {
        results.push({ type: 'SMS', contact: contact.name, status: 'error', error: err.message });
        console.error(`   ❌ [SMS] Failed for ${contact.name} (${e164Number}):`, err.message);
      }

      // WhatsApp
      try {
        const wa = await client.messages.create({
          body: fullMessage,
          from: whatsappNumber,
          to: `whatsapp:${e164Number}`
        });
        results.push({ type: 'WhatsApp', contact: contact.name, status: 'success', sid: wa.sid });
        console.log(`   ✅ [WhatsApp] Sent to ${contact.name} (${e164Number}): ${wa.sid}`);
      } catch (err) {
        results.push({ type: 'WhatsApp', contact: contact.name, status: 'error', error: err.message });
        console.error(`   ❌ [WhatsApp] Failed for ${contact.name} (${e164Number}):`, err.message);
      }
    }

    // 2. Initiate Voice Call to Primary Contact
    if (contacts.length > 0) {
      const primaryE164 = formatToE164(contacts[0].number);
      try {
        const call = await client.calls.create({
          twiml: `<Response><Say voice="alice">This is an emergency alert from Shield. The user may be in danger. Please check the location sent to you via message.</Say></Response>`,
          from: twilioNumber,
          to: primaryE164
        });
        results.push({ type: 'Voice', contact: contacts[0].name, status: 'success', sid: call.sid });
        console.log(`   📞 [VOICE CALL] Initiated to ${contacts[0].name} (${primaryE164}): ${call.sid}`);
      } catch (err) {
        results.push({ type: 'Voice', contact: contacts[0].name, status: 'error', error: err.message });
        console.error(`   ❌ [VOICE CALL] Failed for ${contacts[0].name} (${primaryE164}):`, err.message);
      }
    }

    // 3. Email Backup
    if (userId && userId.includes('@')) {
      try {
        await sendMail(
          userId,
          "🚨 EMERGENCY TRIGGERED - Shield App",
          `You triggered an emergency alert. We have sent your location to your ${contacts.length} trusted contacts.\n\nLocation: ${mapsLink}`,
          `<div style="font-family: Arial, sans-serif; color: #E74C3C; padding: 20px; border: 2px solid #E74C3C; border-radius: 12px;">
            <h1 style="margin-top: 0;">🚨 Emergency Activated</h1>
            <p>You triggered a shake-detection emergency alert on your Shield device.</p>
            <p><strong>Status:</strong> Your ${contacts.length} contacts have been notified automatically via SMS/WhatsApp.</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Active Location:</strong> <a href="${mapsLink}">View on Google Maps</a></p>
            </div>
            <p style="font-size: 12px; color: #666;">This is an automated security action by Shield.</p>
          </div>`
        );
        results.push({ type: 'Email', contact: userId, status: 'success' });
      } catch (err) {
        results.push({ type: 'Email', contact: userId, status: 'error', error: err.message });
      }
    }

    res.status(200).json({ 
      message: "Emergency alerts processed",
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Backend Emergency Error:", error);
    res.status(500).json({ message: "Failed to process emergency alert", error: error.message });
  }
};

export const uploadEmergencyAudio = async (req, res) => {
  const { contacts } = req.body;
  const file = req.file;

  if (!file || !contacts) {
    return res.status(400).json({ message: "Audio file and contacts are required." });
  }

  let parsedContacts = [];
  try {
    parsedContacts = typeof contacts === 'string' ? JSON.parse(contacts) : contacts;
  } catch (e) {
    console.error("Failed to parse contacts", e);
    return res.status(400).json({ message: "Invalid contacts format." });
  }

  try {
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    console.log("⬆️ Uploading emergency audio to Cloudinary...");
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      resource_type: "video",
      folder: "emergency_audio"
    });

    console.log("✅ Audio uploaded: ", uploadResult.secure_url);

    // WhatsApp officially prefers mp3 or ogg for voice notes over Twilio
    // Cloudinary automatically transcodes the file if we change the extension!
    const whatsappAudioUrl = uploadResult.secure_url.replace(/\.[^/.]+$/, ".mp3");
    console.log("🎵 Transcoded URL for WhatsApp: ", whatsappAudioUrl);

    if (!client && accountSid && authToken) {
      client = twilio(accountSid, authToken);
    }
    if (!client) return res.status(500).json({ message: "Twilio uninitialized" });

    const results = [];
    const fullMessage = "🚨 FOLLOW UP: Here is the 30-second audio recording from the emergency alert.";

    for (const contact of parsedContacts) {
      const clean = contact.number.replace(/[^\d+]/g, '');
      const e164Number = clean.length === 10 && !clean.startsWith('+') ? `+91${clean}` : clean.startsWith('+') ? clean : `+${clean}`;

      try {
        const wa = await client.messages.create({
          body: fullMessage,
          from: whatsappNumber,
          to: `whatsapp:${e164Number}`,
          mediaUrl: [whatsappAudioUrl]
        });
        results.push({ type: 'WhatsApp Audio', contact: contact.name, status: 'success' });
        console.log(`   ✅ [WhatsApp Audio] Sent to ${contact.name}`);
      } catch (err) {
        console.error(`   ❌ [WhatsApp Audio] Failed for ${contact.name}`, err.message);
        results.push({ type: 'WhatsApp Audio', contact: contact.name, status: 'error', error: err.message });
      }
    }

    res.status(200).json({ message: "Audio alert sent successfully", results, mediaUrl: uploadResult.secure_url });
  } catch (error) {
    console.error("❌ Audio Upload Error:", error);
    res.status(500).json({ message: "Failed to process audio alert", error: error.message });
  }
};
