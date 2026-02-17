const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const { validateBloodType } = require('../utils/validation');

/**
 * Common cookie config
 * Required for Vercel → Render cross-site auth
 */
const cookieOptions = {
  httpOnly: true,
  secure: true,        // MUST be true in production
  sameSite: 'none',    // REQUIRED for cross-domain cookies
};

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    role,
    bloodType,
    address,
    city,
    hospitalName,
    licenseNumber,
  } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'User already exists',
    });
  }

  if (role === 'donor' && bloodType && !validateBloodType(bloodType)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid blood type',
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    role,
    bloodType: role === 'donor' ? bloodType : '',
    address: role === 'donor' ? address : '',
    city: role === 'donor' ? city : '',
    hospitalName: role === 'hospital' ? hospitalName : '',
    licenseNumber: role === 'hospital' ? licenseNumber : '',
  });

  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 30 * 60 * 1000, // 30 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      bloodType: user.bloodType,
      isAvailable: user.isAvailable,
      profilePicture: user.profilePicture,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 30 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      bloodType: user.bloodType,
      isAvailable: user.isAvailable,
      hospitalName: user.hospitalName,
      profilePicture: user.profilePicture,
    },
  });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'No refresh token',
    });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    const newAccessToken = generateToken(user._id);

    res.cookie('accessToken', newAccessToken, {
      ...cookieOptions,
      maxAge: 30 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Access token refreshed',
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  res.cookie('accessToken', '', {
    ...cookieOptions,
    expires: new Date(0),
  });

  res.cookie('refreshToken', '', {
    ...cookieOptions,
    path: '/api/auth/refresh',
    expires: new Date(0),
  });

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  res.json({
    success: true,
    data: user,
  });
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
};
