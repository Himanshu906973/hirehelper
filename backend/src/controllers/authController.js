const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendOTPEmail } = require('../utils/emailService');

// Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc   Register user
// @route  POST /api/auth/register
const register = async (req, res) => {
  try {
    const { first_name, last_name, email_id, phone_number, password } = req.body;

    if (!first_name || !last_name || !email_id || !password) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
    }

    const existingUser = await User.findOne({ email_id });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const otp = generateOTP();
    const otp_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      first_name,
      last_name,
      email_id,
      phone_number,
      password,
      otp,
      otp_expires,
    });

    // Send OTP email (non-blocking)
    try {
      await sendOTPEmail(email_id, otp, first_name);
    } catch (emailErr) {
      console.error('Email send error:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Account created. Please verify your email with the OTP sent.',
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Verify OTP
// @route  POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId).select('+otp +otp_expires');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    if (user.otp_expires < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    user.is_verified = true;
    user.otp = undefined;
    user.otp_expires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully.',
      token,
      user: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email_id: user.email_id,
        phone_number: user.phone_number,
        profile_picture: user.profile_picture,
        bio: user.bio,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Resend OTP
// @route  POST /api/auth/resend-otp
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otp_expires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendOTPEmail(user.email_id, otp, user.first_name);
    } catch (emailErr) {
      console.error('Email send error:', emailErr.message);
    }

    res.status(200).json({ success: true, message: 'OTP resent successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Login user
// @route  POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email_id, password } = req.body;

    if (!email_id || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email_id }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.is_verified) {
      // Re-send OTP
      const otp = generateOTP();
      user.otp = otp;
      user.otp_expires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      try { await sendOTPEmail(user.email_id, otp, user.first_name); } catch (e) {}

      return res.status(403).json({
        success: false,
        message: 'Email not verified. OTP sent to your email.',
        userId: user._id,
        requiresVerification: true,
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email_id: user.email_id,
        phone_number: user.phone_number,
        profile_picture: user.profile_picture,
        bio: user.bio,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get current user
// @route  GET /api/auth/me
const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

module.exports = { register, login, verifyOTP, resendOTP, getMe };
