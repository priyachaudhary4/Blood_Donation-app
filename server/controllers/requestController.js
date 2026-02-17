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

  const donorId = request.donorId?.toString();
  const userId = req.user?._id?.toString();

  if (donorId !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to accept this request',
    });
  }

  if (request.status?.toLowerCase() !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Request is not pending',
    });
  }

  request.status = 'accepted';
  request.acceptedAt = new Date();

  const donor = await User.findById(req.user._id);
  if (donor) {
    donor.isAvailable = false;
    await donor.save();
  }

  const updatedRequest = await request.save();

  // Notify recipient
  if (request.recipientId) {
    await createNotification(
      request.recipientId,
      'Request Accepted',
      `${donor?.name || 'A donor'} has accepted your donation request. Contact: ${donor?.phone}, Address: ${donor?.address}`,
      'acceptance',
      request._id
    );
  }

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

  const donorId = request.donorId?.toString();
  const userId = req.user?._id?.toString();

  if (donorId !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to reject this request',
    });
  }

  if (request.status?.toLowerCase() !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Request is not pending',
    });
  }

  request.status = 'rejected';
  const updatedRequest = await request.save();

  // Notify recipient
  const donor = await User.findById(req.user._id);
  if (request.recipientId) {
    await createNotification(
      request.recipientId,
      'Request Rejected',
      `${donor?.name || 'A donor'} has rejected your donation request`,
      'rejection',
      request._id
    );
  }

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

  // Ultra-safe ID retrieval
  const userId = req.user && req.user._id ? String(req.user._id) : null;
  const userRole = req.user?.role;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Please log in again.',
    });
  }

  // Safety checks for request participants using String() conversion
  const donorId = request.donorId ? String(request.donorId) : null;
  const recipientId = request.recipientId ? String(request.recipientId) : null;
  const hospitalId = request.hospitalId ? String(request.hospitalId) : null;

  const isDonor = donorId === userId;
  const isRecipient = recipientId === userId;
  const isHospital = hospitalId === userId;
  const isAdmin = userRole === 'admin';

  // Authorization check - Enhanced for Admin
  if (!isDonor && !isRecipient && !isHospital && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to complete this donation.',
    });
  }

  if (request.status?.toLowerCase() === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'This donation is already marked as completed.',
    });
  }

  try {
    request.status = 'completed';
    request.completedAt = new Date();
    const updatedRequest = await request.save();

    // 1. Notify donor that they have a certificate now
    if (request.donorId) {
      await createNotification(
        request.donorId,
        'Donation Completed!',
        `Your blood donation has been marked as complete. You can now download your certificate from your history!`,
        'completion',
        request._id
      );
    }

    // 2. Notify recipient or hospital if an Admin or other party completes it
    const notifyTarget = request.recipientId || request.hospitalId;
    if (notifyTarget && String(notifyTarget) !== userId) {
      await createNotification(
        notifyTarget,
        'Blood Received',
        `The blood donation request has been marked as complete. Thank you for using LifeLink!`,
        'completion',
        request._id
      );
    }

    res.json({
      success: true,
      message: 'Donation successfully completed!',
      data: updatedRequest,
    });
  } catch (saveError) {
    console.error('Error saving completed request:', saveError);
    res.status(500).json({
      success: false,
      message: 'Internal server error while saving completion.',
    });
  }
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

// @desc    Delete request (Remove from history)
// @route   DELETE /api/requests/:id
// @access  Private
const deleteRequest = asyncHandler(async (req, res) => {
  const request = await DonationRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Request not found',
    });
  }

  // Ultra-safe ID retrieval
  const userId = req.user && req.user._id ? String(req.user._id) : null;
  const userRole = req.user?.role;

  // Safety checks for request participants
  const donorId = request.donorId ? String(request.donorId) : null;
  const recipientId = request.recipientId ? String(request.recipientId) : null;
  const hospitalId = request.hospitalId ? String(request.hospitalId) : null;

  const isOwner = userId === donorId || userId === recipientId || userId === hospitalId;
  const isAdmin = userRole === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this history record.',
    });
  }

  await request.deleteOne();

  res.json({
    success: true,
    message: 'Record successfully removed from history.',
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
  deleteRequest,
};
