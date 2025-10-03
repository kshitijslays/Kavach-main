import User from "../models/userModel.js";
import { generateToken } from "../utils/generateToken.js";
import { sendMail } from "../utils/sendMail.js";

// 📩 Send OTP to email
export const sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    console.log(`🔄 Processing OTP request for: ${email}`);
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 mins from now

    // Always store in memory for reliability
    global.tempOTPs = global.tempOTPs || {};
    global.tempOTPs[email] = { otp, otpExpiry };
    console.log(`📝 OTP stored in memory for: ${email}`);
    console.log(`🔐 Generated OTP: ${otp} (expires in 5 minutes)`);

    // Try database operations as backup
    try {
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ email, otp, otpExpiry });
        console.log(`✅ New user created in database for: ${email}`);
      } else {
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();
        console.log(`✅ Existing user updated in database for: ${email}`);
      }
    } catch (dbError) {
      console.log(`⚠️ Database not available: ${dbError.message}`);
      console.log(`📝 Using memory storage only`);
    }

    // Try to send email
    try {
      console.log(`📧 Attempting to send email to: ${email}`);
      const emailResult = await sendMail(
        email, 
        "Your Kavach OTP Code", 
        `Your OTP code is: ${otp}. This code will expire in 5 minutes.`,
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #03474f;">Kavach - OTP Verification</h2>
          <p>Your OTP code is:</p>
          <div style="background-color: #f0f9ff; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #03474f; font-size: 32px; margin: 0; letter-spacing: 8px;">${otp}</h1>
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
        `
      );
      
      console.log(`✅ Email sent successfully to: ${email}`);
      res.status(200).json({ 
        message: "OTP sent successfully",
        email: email,
        debug: process.env.NODE_ENV === 'development' ? { otp } : undefined
      });
    } catch (emailError) {
      console.error("❌ Failed to send email:", emailError.message);
      console.error("❌ Full email error:", emailError);
      
      // Still return success if we have memory storage as fallback
      res.status(200).json({ 
        message: "OTP generated successfully (email may have failed)", 
        email: email,
        warning: "Email delivery may have failed, but OTP is valid for verification",
        debug: process.env.NODE_ENV === 'development' ? { otp } : undefined
      });
    }

  } catch (err) {
    console.error("❌ OTP generation error:", err.message);
    res.status(500).json({ message: "OTP sending failed", error: err.message });
  }
};

// ✅ Verify OTP for login/register - FIXED VERSION
// Track ongoing verifications to prevent double processing
const ongoingVerifications = new Set();

export const verifyOTP = async (req, res) => {
  const { email, otp, name, phone } = req.body;
  const verificationKey = `${email}-${otp}`;

  console.log(`🔄 === OTP VERIFICATION DEBUG ===`);
  console.log(`📧 Email: ${email}`);
  console.log(`🔐 Received OTP: "${otp}" (type: ${typeof otp})`);
  console.log(`⏰ Request timestamp: ${new Date().toISOString()}`);

  // Check if this exact verification is already in progress
  if (ongoingVerifications.has(verificationKey)) {
    console.log(`⚠️ Duplicate verification request detected, ignoring`);
    return res.status(409).json({ message: "Verification already in progress" });
  }

  // Mark this verification as ongoing
  ongoingVerifications.add(verificationKey);

  try {
    let user = null;
    let isValidOTP = false;
    let storedOTP = null; // Declare in higher scope

    // Convert both to strings for reliable comparison
    const receivedOTP = String(otp).trim();
    console.log(`🔄 Normalized received OTP: "${receivedOTP}"`);

    // Check memory storage first
    const tempOTP = global.tempOTPs?.[email];
    console.log(`📝 Memory storage:`, tempOTP);
    console.log(`📝 All memory storage:`, global.tempOTPs);
    
    if (tempOTP) {
      storedOTP = String(tempOTP.otp).trim();
      const currentTime = Date.now();
      const isExpired = tempOTP.otpExpiry <= currentTime;
      
      console.log(`🔍 Detailed comparison:`);
      console.log(`  - Stored OTP: "${storedOTP}"`);
      console.log(`  - Received OTP: "${receivedOTP}"`);
      console.log(`  - Match: ${storedOTP === receivedOTP}`);
      console.log(`  - Expires at: ${new Date(tempOTP.otpExpiry).toLocaleString()}`);
      console.log(`  - Current time: ${new Date(currentTime).toLocaleString()}`);
      console.log(`  - Is expired: ${isExpired}`);
      
      if (storedOTP === receivedOTP && !isExpired) {
        isValidOTP = true;
        user = {
          _id: email,
          email,
          name: name || "User",
          phone: phone || "",
          isVerified: true
        };
        
        console.log(`✅ OTP verified via memory storage`);
        // Clean up memory AFTER verification is complete
        delete global.tempOTPs[email];
      } else {
        console.log(`❌ Memory verification failed - OTP match: ${storedOTP ? (storedOTP === receivedOTP) : 'N/A'}, Expired: ${isExpired}`);
      }
    }

    // Fallback to database if memory check failed
    if (!isValidOTP) {
      try {
        const dbUser = await User.findOne({ email });
        console.log(`📝 Database user found:`, !!dbUser);
        
        if (dbUser && dbUser.otp && dbUser.otpExpiry) {
          const dbOTP = String(dbUser.otp).trim();
          const dbNotExpired = dbUser.otpExpiry > Date.now();
          
          console.log(`🔍 Database comparison:`);
          console.log(`  - DB OTP: "${dbOTP}"`);
          console.log(`  - Received: "${receivedOTP}"`);
          console.log(`  - Match: ${dbOTP === receivedOTP}`);
          console.log(`  - Not expired: ${dbNotExpired}`);
          
          if (dbOTP === receivedOTP && dbNotExpired) {
            isValidOTP = true;
            user = dbUser;
            
            // Update user
            user.name = name || user.name;
            user.phone = phone || user.phone;
            user.isVerified = true;
            user.otp = null;
            user.otpExpiry = null;
            await user.save();
            
            console.log(`✅ OTP verified via database`);
          }
        }
      } catch (dbError) {
        console.log(`⚠️ Database check failed: ${dbError.message}`);
      }
    }

    if (!isValidOTP) {
      console.log(`❌ FINAL RESULT: OTP verification failed`);
      ongoingVerifications.delete(verificationKey); // Cleanup before returning
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const token = generateToken(user._id);
    console.log(`✅ FINAL RESULT: OTP verification successful`);

    res.status(200).json({ 
      message: "Verification successful", 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        isVerified: user.isVerified
      }, 
      token 
    });

  } catch (err) {
    console.error(`❌ OTP verification error:`, err.message);
    res.status(500).json({ message: "OTP verification failed", error: err.message });
  } finally {
    // Always clean up the ongoing verification tracker
    ongoingVerifications.delete(verificationKey);
  }
};

// 🔐 Google Login
export const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );
    const decodedToken = await response.json();

    if (!decodedToken || !decodedToken.email_verified) {
      return res.status(401).json({ message: "Invalid Google ID token" });
    }

    const { email, name, sub: googleId } = decodedToken;
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        isVerified: true,
      });
    }

    const token = generateToken(user._id);
    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    res.status(400).json({ message: "Google login failed", error: error.message });
  }
};