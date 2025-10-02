import User from "../models/userModel.js";
import { generateToken } from "../utils/generateToken.js";
import { sendMail } from "../utils/sendMail.js";

// 📩 Send OTP to email
export const sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 mins from now

    if (!user) {
      user = await User.create({ email, otp, otpExpiry });
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
    }

    await sendMail(email, "Your OTP Code", `<p>Your OTP is: <b>${otp}</b></p>`);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "OTP sending failed", error: err.message });
  }
};

// ✅ Verify OTP for login/register
export const verifyOTP = async (req, res) => {
  const { email, otp, name, phone } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({ message: "Verification successful", user, token });
  } catch (err) {
    res
      .status(500)
      .json({ message: "OTP verification failed", error: err.message });
  }
};

// 🔐 Google Login (with token decoding using fetch from Google API)
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
    res
      .status(400)
      .json({ message: "Google login failed", error: error.message });
  }
};
