const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { validateBloodType } = require('../utils/validation');

// @desc    Get donors (with filters)
// @route   GET /api/users/donors
// @access  Private
const getDonors = asyncHandler(async (req, res) => {
  const { bloodType, city, available } = req.query;

  const filter = { role: 'donor' };

  // Recipients can only see available donors
  if (req.user.role === 'recipient') {
    filter.isAvailable = true;
  } else if (available !== undefined && req.user.role === 'donor') {
    // Donors can filter by availability when viewing others
    filter.isAvailable = available === 'true';
  }

  if (bloodType && validateBloodType(bloodType)) {
    filter.bloodType = bloodType;
  }

  if (city) {
    filter.city = { $regex: city, $options: 'i' };
  }

  const donors = await User.find(filter)
    .select('-password -email') // Don't show email/password
    .sort({ isAvailable: -1, createdAt: -1 });

  // For recipients, hide full address
  const filteredDonors = donors.map(donor => {
    const donorObj = donor.toObject();
    if (req.user.role === 'recipient') {
      // Only show city, not full address
      delete donorObj.address;
      delete donorObj.phone;
    }
    return donorObj;
  });

  res.json({
    success: true,
    count: filteredDonors.length,
    data: filteredDonors,
  });
});

// @desc    Get donor by ID
// @route   GET /api/users/donors/:id
// @access  Private
const getDonorById = asyncHandler(async (req, res) => {
  const donor = await User.findById(req.params.id).select('-password');

  if (!donor || donor.role !== 'donor') {
    return res.status(404).json({
      success: false,
      message: 'Donor not found',
    });
  }

  // Recipients can only see available donors
  if (req.user.role === 'recipient' && !donor.isAvailable) {
    return res.status(403).json({
      success: false,
      message: 'Donor is not available',
    });
  }

  // Recipients cannot see full details until request is accepted
  const donorObj = donor.toObject();
  if (req.user.role === 'recipient') {
    delete donorObj.address;
    delete donorObj.phone;
    delete donorObj.email;
  }

  res.json({
    success: true,
    data: donorObj,
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, bloodType, address, city, hospitalName, licenseNumber } = req.body;

  const user = await User.findById(req.user._id);

  // Common fields for all
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (city !== undefined) user.city = city;

  // Role specific fields
  if (req.user.role === 'donor' || req.user.role === 'recipient') {
    if (bloodType && validateBloodType(bloodType)) {
      user.bloodType = bloodType;
    }
  }

  if (req.user.role === 'hospital') {
    if (hospitalName) user.hospitalName = hospitalName;
    if (licenseNumber) user.licenseNumber = licenseNumber;
  }

  if (req.file) {
    // If using Cloudinary, path is the URL. If local, we need to prefix /uploads/
    if (req.file.path && req.file.path.startsWith('http')) {
      user.profilePicture = req.file.path;
    } else {
      user.profilePicture = `/uploads/${req.file.filename}`;
    }
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: updatedUser,
  });
});

// @desc    Update donor availability
// @route   PUT /api/users/availability
// @access  Private (Donor only)
const updateAvailability = asyncHandler(async (req, res) => {
  if (req.user.role !== 'donor') {
    return res.status(403).json({
      success: false,
      message: 'Only donors can update availability',
    });
  }

  const { isAvailable } = req.body;

  const user = await User.findById(req.user._id);
  user.isAvailable = isAvailable;

  if (!isAvailable) {
    user.lastDonation = new Date();
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: updatedUser,
  });
});

// @desc    Get all donors (Hospital only - sees all)
// @route   GET /api/users/hospital/donors
// @access  Private (Hospital only)
const getAllDonorsForHospital = asyncHandler(async (req, res) => {
  const { bloodType, city } = req.query;

  const filter = { role: 'donor' };

  if (bloodType && validateBloodType(bloodType)) {
    filter.bloodType = bloodType;
  }

  if (city) {
    filter.city = { $regex: city, $options: 'i' };
  }

  const donors = await User.find(filter)
    .select('-password')
    .sort({ isAvailable: -1, createdAt: -1 });

  res.json({
    success: true,
    count: donors.length,
    data: donors,
  });
});

module.exports = {
  getDonors,
  getDonorById,
  updateProfile,
  updateAvailability,
  getAllDonorsForHospital,
};
