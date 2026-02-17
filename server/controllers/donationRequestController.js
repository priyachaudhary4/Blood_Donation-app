const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const DonationRequest = require('../models/DonationRequest');

const { sendEmail } = require('../utils/emailService');

// @desc    Notify specific donor (Create DonationRequest)
// @route   POST /api/admin/notify
// @access  Private (Admin only)
const notifyDonor = asyncHandler(async (req, res) => {
    const { donorId, bloodType, message } = req.body;

    // Verify donor exists
    const donor = await User.findById(donorId);
    if (!donor || donor.role !== 'donor') {
        return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    const request = await DonationRequest.create({
        requesterId: req.user._id,
        donorId,
        bloodType,
        message,
        type: 'Individual',
        status: 'Pending'
    });

    // Send Email
    let emailInfo;
    try {
        emailInfo = await sendEmail({
            to: donor.email,
            subject: `Urgent Blood Donation Request: ${bloodType}`,
            text: `Hello ${donor.name},\n\nWe have an urgent need for ${bloodType} blood.\n\nMessage: ${message}\n\nPlease login to your dashboard to view details and accept.\n\nThank you,\nLifeLink Team`
        });
    } catch (error) {
        console.error("Email sending failed:", error);
    }

    res.status(201).json({
        success: true,
        data: request,
        message: 'Notification sent successfully',
        previewUrl: emailInfo ? emailInfo.previewUrl : null
    });
});

// @desc    Create Bulk Request (Blood Drive / Emergency)
// @route   POST /api/admin/bulk-request
// @access  Private (Admin only)
const createBulkRequest = asyncHandler(async (req, res) => {
    const { bloodType, message, type, scheduledDate, location, startTime, endTime, latitude, longitude } = req.body; // type: 'Broadcast' or 'Drive'

    // Find all eligible donors
    const query = { role: 'donor' };
    if (bloodType !== 'All') {
        query.bloodType = bloodType;
    }

    const donors = await User.find(query);

    if (donors.length === 0) {
        return res.status(404).json({ success: false, message: 'No matching donors found' });
    }

    const requests = donors.map(donor => ({
        requesterId: req.user._id,
        donorId: donor._id,
        bloodType: donor.bloodType,
        message,
        type: type || 'Broadcast',
        status: 'Pending',
        scheduledDate,
        location,
        startTime,
        endTime,
        latitude,
        longitude
    }));

    await DonationRequest.insertMany(requests);

    // Send Bulk Emails (In background ideally)
    donors.forEach(donor => {
        sendEmail({
            to: donor.email,
            subject: `New Blood Drive Alert: ${type}`,
            text: `Hello ${donor.name},\n\nA new ${type} has been scheduled near you.\n\nMessage: ${message}\n\nPlease check your dashboard for location and more details.\n\nThank you,\nLifeLink Team`
        }).catch(err => console.error(`Failed to email ${donor.email}`, err));
    });

    res.status(201).json({
        success: true,
        count: donors.length,
        message: `Successfully notified ${donors.length} donors`
    });
});

// @desc    Get all donation requests (History)
// @route   GET /api/admin/donation-requests
// @access  Private (Admin only)
const getDonationRequests = asyncHandler(async (req, res) => {
    const requests = await DonationRequest.find()
        .populate('donorId', 'name email phone bloodType')
        .populate('requesterId', 'name')
        .sort({ requestDate: -1 });

    res.json({
        success: true,
        data: requests
    });
});



// @desc    Get my donation requests (For Donor)
// @route   GET /api/donor/requests
// @access  Private (Donor only)
const getMyDonationRequests = asyncHandler(async (req, res) => {
    const requests = await DonationRequest.find({ donorId: req.user._id })
        .populate('requesterId', 'name email')
        .populate('hospitalId', 'hospitalName name')
        .populate('recipientId', 'name')
        .sort({ requestDate: -1 });

    res.json({
        success: true,
        data: requests
    });
});



// @desc    Update donation request status (Accept/Decline)
// @route   PUT /api/donor/requests/:id/status
// @access  Private (Donor only)
const updateDonationRequestStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const request = await DonationRequest.findById(req.params.id);

    if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Safe string conversion for authorization
    if (String(request.donorId) !== String(req.user._id)) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    request.status = status;
    await request.save();

    res.json({
        success: true,
        data: request,
        message: `Request ${status.toLowerCase()} successfully`
    });
});

// @desc    Update donation request status (Admin - Mark Complete)
// @route   PUT /api/admin/donation-requests/:id/status
// @access  Private (Admin only)
const updateDonationStatusAdmin = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const request = await DonationRequest.findById(req.params.id);

    if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request.status = status;
    await request.save();

    res.json({
        success: true,
        data: request,
        message: `Request status updated to ${status}`
    });
});

// @desc    Delete donation request (Admin Cleanup)
// @route   DELETE /api/admin/donation-requests/:id
// @access  Private (Admin only)
const deleteDonationRequestAdmin = asyncHandler(async (req, res) => {
    const request = await DonationRequest.findById(req.params.id);

    if (!request) {
        return res.status(404).json({ success: false, message: 'Record not found in history' });
    }

    await request.deleteOne();

    res.json({
        success: true,
        message: 'History record successfully purged'
    });
});

module.exports = {
    notifyDonor,
    createBulkRequest,
    getDonationRequests,
    getMyDonationRequests,
    updateDonationRequestStatus,
    updateDonationStatusAdmin,
    deleteDonationRequestAdmin
};
