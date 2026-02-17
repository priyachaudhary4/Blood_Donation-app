const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const BloodStock = require('../models/BloodStock');
const HospitalRequest = require('../models/HospitalRequest');
const DonationRequest = require('../models/DonationRequest');

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getStats = asyncHandler(async (req, res) => {
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalRecipients = await User.countDocuments({ role: 'recipient' });
    const totalHospitals = await User.countDocuments({ role: 'hospital' });

    const bloodStock = await BloodStock.find();
    const totalBloodUnits = bloodStock.reduce((acc, curr) => acc + curr.quantity, 0);

    const pendingRequests = await HospitalRequest.countDocuments({ status: 'pending' });

    res.json({
        success: true,
        data: {
            users: {
                donors: totalDonors,
                recipients: totalRecipients,
                hospitals: totalHospitals
            },
            blood: {
                totalUnits: totalBloodUnits,
                stock: bloodStock
            },
            requests: {
                pending: pendingRequests
            }
        }
    });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({
        success: true,
        data: users
    });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.deleteOne();

    res.json({
        success: true,
        message: 'User removed'
    });
});

module.exports = {
    getStats,
    getAllUsers,
    deleteUser
};
