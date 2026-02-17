const asyncHandler = require('express-async-handler');
const BloodDrive = require('../models/BloodDrive');

// @desc    Create Blood Drive
// @route   POST /api/drives
// @access  Private (Admin/Hospital)
const createDrive = asyncHandler(async (req, res) => {
    const { title, date, startTime, endTime, location, description, bloodTypes, latitude, longitude } = req.body;

    const drive = await BloodDrive.create({
        organizerId: req.user._id,
        title,
        date,
        startTime,
        endTime,
        location,
        description,
        bloodTypes: bloodTypes || ['All'],
        latitude,
        longitude
    });

    res.status(201).json({
        success: true,
        data: drive
    });
});

// @desc    Get All Upcoming Drives
// @route   GET /api/drives
// @access  Private (All)
const getDrives = asyncHandler(async (req, res) => {
    const drives = await BloodDrive.find({ status: 'Upcoming' })
        .populate('organizerId', 'name email hospitalName')
        .sort({ date: 1 });

    res.json({
        success: true,
        data: drives
    });
});

// @desc    Get Drives by Organizer
// @route   GET /api/drives/my-drives
// @access  Private (Admin/Hospital)
const getMyDrives = asyncHandler(async (req, res) => {
    const drives = await BloodDrive.find({ organizerId: req.user._id })
        .populate('attendees.donorId', 'name email phone bloodType')
        .sort({ date: -1 });

    res.json({
        success: true,
        data: drives
    });
});

// @desc    Register for a Drive
// @route   PUT /api/drives/:id/register
// @access  Private (Donor)
const registerForDrive = asyncHandler(async (req, res) => {
    const drive = await BloodDrive.findById(req.params.id);

    if (!drive) {
        return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    // Check if already registered
    const alreadyRegistered = drive.attendees.find(
        (a) => a.donorId.toString() === req.user._id.toString()
    );

    if (alreadyRegistered) {
        return res.status(400).json({ success: false, message: 'Already registered for this drive' });
    }

    drive.attendees.push({ donorId: req.user._id });
    await drive.save();

    res.json({
        success: true,
        message: 'Successfully registered for the drive'
    });
});

module.exports = {
    createDrive,
    getDrives,
    getMyDrives,
    registerForDrive
};
