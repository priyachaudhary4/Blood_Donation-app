const asyncHandler = require('express-async-handler');
const DonationRequest = require('../models/DonationRequest');
const User = require('../models/User');
const { createNotification } = require('../utils/sendNotification');

// @desc    Create donation request
// @route   POST /api/requests
// @access  Private (Recipient only)
const createRequest = asyncHandler(async (req, res) => {
  const { donorId, bloodType, unitsNeeded, urgency, message, patientName, contactPhone } = req.body;

  if (req.user.role !== 'recipient' && req.user.role !== 'hospital') {
    return res.status(403).json({
      success: false,
      message: 'Only recipients or hospitals can create requests',
    });
  }

  const donor = await User.findById(donorId);
  if (!donor || donor.role !== 'donor' || !donor.isAvailable) {
    return res.status(400).json({
      success: false,
      message: 'Donor not available',
    });
  }

  const request = await DonationRequest.create({
    recipientId: req.user.role === 'recipient' ? req.user._id : undefined,
    hospitalId: req.user.role === 'hospital' ? req.user._id : undefined,
    donorId,
    bloodType,
    unitsNeeded,
    urgency,
    message,
    patientName,
    contactPhone,
  });

  // Notify donor
  await createNotification(
    donorId,
    'New Donation Request',
    `${req.user.name} has requested ${unitsNeeded} unit(s) of ${bloodType} blood for ${patientName}`,
    'request',
    request._id
  );

  res.status(201).json({
    success: true,
    data: request,
  });
});

// @desc    Get user's requests
// @route   GET /api/requests/my-requests
// @access  Private
const getMyRequests = asyncHandler(async (req, res) => {
  let filter = {};

  if (req.user.role === 'recipient') {
    filter.recipientId = req.user._id;
  } else if (req.user.role === 'donor') {
    filter.donorId = req.user._id;
  } else if (req.user.role === 'hospital') {
    filter.hospitalId = req.user._id;
  }

  const requests = await DonationRequest.find(filter)
    .populate('recipientId', 'name phone')
    .populate('donorId', 'name phone bloodType address city')
    .populate('hospitalId', 'name hospitalName')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: requests.length,
    data: requests,
  });
});

// @desc    Get pending requests for donor
// @route   GET /api/requests/pending
// @access  Private (Donor only)
const getPendingRequests = asyncHandler(async (req, res) => {
  if (req.user.role !== 'donor') {
    return res.status(403).json({
      success: false,
      message: 'Only donors can view pending requests',
    });
  }

  const requests = await DonationRequest.find({
    donorId: req.user._id,
    status: 'pending',
  })
    .populate('recipientId', 'name')
    .sort({ urgency: -1, createdAt: -1 });

  res.json({
    success: true,
    count: requests.length,
    data: requests,
  });
});

// @desc    Accept request
// @route   PUT /api/requests/:id/accept
// @access  Private (Donor only)
const acceptRequest = asyncHandler(async (req, res) => {
  if (req.user.role !== 'donor') {
    return res.status(403).json({
      success: false,
      message: 'Only donors can accept requests',
    });
  }

  const request = await DonationRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Request not found',
    });
  }

  if (request.donorId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to accept this request',
    });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Request is not pending',
    });
  }

  request.status = 'accepted';
  request.acceptedAt = new Date();

  const donor = await User.findById(req.user._id);
  donor.isAvailable = false;
  await donor.save();

  const updatedRequest = await request.save();

  // Notify recipient
  const recipient = await User.findById(request.recipientId);
  await createNotification(
    request.recipientId,
    'Request Accepted',
    `${donor.name} has accepted your donation request. Contact: ${donor.phone}, Address: ${donor.address}`,
    'acceptance',
    request._id
  );

  res.json({
    success: true,
    data: updatedRequest,
  });
});

// @desc    Reject request
// @route   PUT /api/requests/:id/reject
// @access  Private (Donor only)
const rejectRequest = asyncHandler(async (req, res) => {
  if (req.user.role !== 'donor') {
    return res.status(403).json({
      success: false,
      message: 'Only donors can reject requests',
    });
  }

  const request = await DonationRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Request not found',
    });
  }

  if (request.donorId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to reject this request',
    });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Request is not pending',
    });
  }

  request.status = 'rejected';
  const updatedRequest = await request.save();

  // Notify recipient
  const donor = await User.findById(req.user._id);
  await createNotification(
    request.recipientId,
    'Request Rejected',
    `${donor.name} has rejected your donation request`,
    'rejection',
    request._id
  );

  res.json({
    success: true,
    data: updatedRequest,
  });
});

// @desc    Mark request as complete
// @route   PUT /api/requests/:id/complete
// @access  Private
const completeRequest = asyncHandler(async (req, res) => {
  const request = await DonationRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Request not found',
    });
  }

  // Only donor, recipient, or associated hospital can complete
  const isDonor = request.donorId && request.donorId.toString() === req.user._id.toString();
  const isRecipient = request.recipientId && request.recipientId.toString() === req.user._id.toString();
  const isHospital = request.hospitalId && request.hospitalId.toString() === req.user._id.toString();

  if (!isDonor && !isRecipient && !isHospital) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to complete this request',
    });
  }

  if (request.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Request already completed',
    });
  }

  request.status = 'completed';
  request.completedAt = new Date();
  const updatedRequest = await request.save();

  // Notify recipient if hospital completes (and if there is a recipient)
  if (req.user.role === 'hospital' && request.recipientId) {
    await createNotification(
      request.recipientId,
      'Blood Arranged',
      `Hospital ${req.user.hospitalName || req.user.name} has arranged the blood donation`,
      'completion',
      request._id
    );
  }

  res.json({
    success: true,
    data: updatedRequest,
  });
});

// @desc    Emergency broadcast (Hospital only)
// @route   POST /api/requests/emergency
// @access  Private (Hospital only)
const emergencyBroadcast = asyncHandler(async (req, res) => {
  if (req.user.role !== 'hospital') {
    return res.status(403).json({
      success: false,
      message: 'Only hospitals can send emergency broadcasts',
    });
  }

  const { bloodType, city, message, patientName, unitsNeeded, contactPhone } = req.body;

  const filter = { role: 'donor', isAvailable: true };
  if (bloodType) filter.bloodType = bloodType;
  if (city) filter.city = { $regex: city, $options: 'i' };

  const donors = await User.find(filter);

  // Create notifications for all matching donors
  const notifications = donors.map(donor =>
    createNotification(
      donor._id,
      'Emergency Blood Request',
      `${message || `Emergency blood needed for ${patientName}`} - Contact: ${contactPhone || req.user.phone}`,
      'emergency'
    )
  );

  await Promise.all(notifications);

  res.json({
    success: true,
    message: `Emergency broadcast sent to ${donors.length} donors`,
    data: { count: donors.length },
  });
});

module.exports = {
  createRequest,
  getMyRequests,
  getPendingRequests,
  acceptRequest,
  rejectRequest,
  completeRequest,
  emergencyBroadcast,
};
