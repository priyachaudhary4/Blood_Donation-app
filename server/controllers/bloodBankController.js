const asyncHandler = require('express-async-handler');
const BloodStock = require('../models/BloodStock');
const BloodUnit = require('../models/BloodUnit');
const HospitalRequest = require('../models/HospitalRequest');
const DonationRequest = require('../models/DonationRequest');
const User = require('../models/User');
const { createNotification } = require('../utils/sendNotification');

// @desc    Get blood stock levels (Aggregated from BloodUnits)
// @route   GET /api/bloodbank/stock
// @access  Private
const getStock = asyncHandler(async (req, res) => {
    // Aggregate count of 'Available' units by blood type
    const stock = await BloodUnit.aggregate([
        { $match: { status: 'Available' } },
        { $group: { _id: '$bloodType', quantity: { $sum: 1 } } }
    ]);

    // Format for frontend (ensure all types exist in array even if 0)
    const allTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    const formattedStock = allTypes.map(type => {
        const found = stock.find(s => s._id === type);
        return { bloodType: type, quantity: found ? found.quantity : 0 };
    });

    res.json({
        success: true,
        data: formattedStock
    });
});

// @desc    Add blood stock (Create BloodUnits)
// @route   PUT /api/bloodbank/stock
// @access  Private (Admin only)
const updateStock = asyncHandler(async (req, res) => {
    const { bloodType, quantity, action, donorId } = req.body;

    if (action === 'add') {
        const { donorId, manualDonorName, manualDonorPhone } = req.body;

        if (!donorId && (!manualDonorName || !manualDonorPhone)) {
            return res.status(400).json({ success: false, message: 'Please provide either a registered Donor or Manual Donor details (Name & Phone)' });
        }

        const today = new Date();
        const expiryDate = new Date(today);
        expiryDate.setDate(expiryDate.getDate() + 42); // 42 days shelf life

        const units = [];
        for (let i = 0; i < quantity; i++) {
            units.push({
                bloodType,
                donorId: donorId || undefined,
                manualDonorName: !donorId ? manualDonorName : undefined,
                manualDonorPhone: !donorId ? manualDonorPhone : undefined,
                status: 'Available',
                donationDate: today,
                expiryDate: expiryDate
            });
        }
        await BloodUnit.insertMany(units);

    } else if (action === 'subtract') {
        // Find 'Available' units and mark them as 'Used' (or removed)
        const unitsToRemove = await BloodUnit.find({ bloodType, status: 'Available' }).limit(parseInt(quantity));

        if (unitsToRemove.length < quantity) {
            return res.status(400).json({ success: false, message: 'Insufficient stock' });
        }

        for (const unit of unitsToRemove) {
            unit.status = 'Used';
            unit.updatedBy = req.user._id;
            await unit.save();
        }
    } else if (action === 'set') {
        // 'set' is tricky with individual units. We'll disable it or implement it as "remove all available, then add X new ones". 
        // For now, let's return error that 'set' is not supported in this new mode, or better, just handle adding/removing.
        // Or simpler: We will deprecate 'set' for now in frontend.
        return res.status(400).json({ success: false, message: 'Set action is not supported in granular tracking mode. Please use Add or Remove.' });
    }

    // Return updated stock aggregation
    const stock = await BloodUnit.aggregate([
        { $match: { status: 'Available' } },
        { $group: { _id: '$bloodType', quantity: { $sum: 1 } } }
    ]);
    const allTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    const formattedStock = allTypes.map(type => {
        const found = stock.find(s => s._id === type);
        return { bloodType: type, quantity: found ? found.quantity : 0 };
    });

    res.json({
        success: true,
        data: { bloodType, quantity, action, stock: formattedStock }
    });
});

// @desc    Create hospital request
// @route   POST /api/bloodbank/requests
// @access  Private (Hospital or Admin)
const createRequest = asyncHandler(async (req, res) => {
    const { bloodType, unitsNeeded, urgency, hospitalName, patientName } = req.body;

    let requestData = {
        bloodType,
        unitsNeeded,
        urgency,
        patientName
    };

    if (req.user.role === 'hospital') {
        requestData.hospitalId = req.user._id;
        requestData.hospitalName = req.user.hospitalName || req.user.name;
    } else if (req.user.role === 'admin') {
        // Admin manually creating request
        if (!hospitalName) {
            return res.status(400).json({ success: false, message: 'Hospital Name is required' });
        }
        requestData.hospitalName = hospitalName;
        // No hospitalId if manual
    } else if (req.user.role === 'recipient') {
        requestData.hospitalId = req.user._id;
        requestData.hospitalName = `Recipient: ${req.user.name}`;
    } else {
        return res.status(403).json({ success: false, message: 'Not authorized to create requests' });
    }

    const request = await HospitalRequest.create(requestData);

    // Notify Admins about the new request
    const admins = await User.find({ role: 'admin' });
    const notificationPromises = admins.map(admin =>
        createNotification(
            admin._id,
            'New Hospital Request',
            `${requestData.hospitalName} has requested ${unitsNeeded} units of ${bloodType} (${urgency})`,
            'request',
            request._id
        )
    );
    await Promise.all(notificationPromises);

    res.status(201).json({
        success: true,
        data: request
    });
});

// @desc    Get all requests
// @route   GET /api/bloodbank/requests
// @access  Private (Admin/Hospital)
const getRequests = asyncHandler(async (req, res) => {
    let query = {};

    // Hospitals/Recipients only see their own requests
    if (req.user.role === 'hospital' || req.user.role === 'recipient') {
        query.hospitalId = req.user._id;
    }

    const requests = await HospitalRequest.find(query)
        .populate('hospitalId', 'name hospitalName email phone')
        .sort({ requestDate: -1 });

    res.json({
        success: true,
        data: requests
    });
});

// @desc    Update request status
// @route   PUT /api/bloodbank/requests/:id
// @access  Private (Admin only)
const updateRequestStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const request = await HospitalRequest.findById(req.params.id);

    if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only admins can update request status' });
    }

    // Handle stock deduction when moving to approved status
    if (status === 'approved' && request.status !== 'approved') {
        const availableUnits = await BloodUnit.find({ bloodType: request.bloodType, status: 'Available' }).limit(request.unitsNeeded);

        if (availableUnits.length < request.unitsNeeded) {
            return res.status(400).json({ success: false, message: 'Insufficient blood stock to approve request' });
        }

        for (const unit of availableUnits) {
            unit.status = 'Used';
            unit.hospitalId = request.hospitalId;
            unit.updatedBy = req.user._id;
            await unit.save();

            if (unit.donorId) {
                const beneficiaryName = request.patientName || request.hospitalName || 'LifeLink Beneficiary';
                const donationRecord = await DonationRequest.create({
                    donorId: unit.donorId,
                    recipientId: request.hospitalId,
                    bloodType: unit.bloodType,
                    unitsNeeded: 1,
                    status: 'completed',
                    completedAt: new Date(),
                    requestDate: unit.donationDate,
                    patientName: beneficiaryName,
                    message: `LifeLink: Your donation helped ${beneficiaryName}.`
                });

                await createNotification(
                    unit.donorId,
                    'Blood Donation Used!',
                    `Good news! Your ${unit.bloodType} blood donation was used to help a patient. Thank you for your kindness!`,
                    'completion',
                    donationRecord._id
                );
            }
        }
    }

    request.status = status;
    request.resolvedDate = Date.now();
    request.resolvedBy = req.user._id;
    await request.save();

    res.json({
        success: true,
        message: `Request marked as ${status}`,
        data: request
    });
});

// @desc    Complete hospital request (Mark as Received)
// @route   PUT /api/bloodbank/requests/:id/complete
// @access  Private (Hospital/Recipient/Admin)
const completeHospitalRequest = asyncHandler(async (req, res) => {
    const request = await HospitalRequest.findById(req.params.id);

    if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
    }

    console.log(`[BANK_COMPLETE] Attempting to complete request ${req.params.id} by user ${req.user._id} (${req.user.role})`);
    const isOwner = request.hospitalId && String(request.hospitalId) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
        console.warn(`[BANK_COMPLETE] Unauthorized access by user ${req.user._id}. Owner is ${request.hospitalId}`);
        return res.status(403).json({ success: false, message: 'Not authorized to complete this request' });
    }

    request.status = 'completed';
    request.resolvedDate = Date.now();
    await request.save();
    console.log(`[BANK_COMPLETE] Request ${req.params.id} successfully marked as completed`);

    // Notify Admins that blood has been received
    const admins = await User.find({ role: 'admin' });
    const notificationPromises = admins.map(admin =>
        createNotification(
            admin._id,
            'Blood Received by Hospital',
            `${request.hospitalName} has marked the request for ${request.bloodType} (${request.unitsNeeded} units) as RECEIVED.`,
            'completion',
            request._id
        )
    );
    await Promise.all(notificationPromises);

    res.json({
        success: true,
        message: 'Blood unit(s) marked as received. Request completed.',
        data: request
    });
});

// @desc    Get donors (Blood Units) by blood type
// @route   GET /api/bloodbank/donors/:bloodType
// @access  Private (Admin only)
const getDonorsByBloodType = asyncHandler(async (req, res) => {
    const { bloodType } = req.params;
    console.log(`Fetching donors for blood type: ${bloodType}`);

    // Fetch AVAILABLE units of this type, populate donor
    const units = await BloodUnit.find({
        bloodType: bloodType,
        status: 'Available'
    }).populate('donorId', 'name email phone bloodType address city state lastDonation isAvailable');

    console.log(`Found ${units.length} units`);
    if (units.length > 0) {
        console.log('First unit donor:', units[0].donorId);
    }

    res.json({
        success: true,
        data: units
    });
});

// @desc    Delete hospital request
// @route   DELETE /api/bloodbank/requests/:id
// @access  Private (Admin only)
const deleteRequest = asyncHandler(async (req, res) => {
    const request = await HospitalRequest.findById(req.params.id);

    if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Authorization check: Admin or the hospital who created it
    const isOwner = request.hospitalId && String(request.hospitalId) === String(req.user._id);
    const isRecipient = request.recipientId && String(request.recipientId) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isRecipient && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this request history' });
    }

    await request.deleteOne();

    res.json({
        success: true,
        message: 'Record successfully removed from history',
        data: {}
    });
});

module.exports = {
    getStock,
    updateStock,
    createRequest,
    getRequests,
    updateRequestStatus,
    completeHospitalRequest,
    getDonorsByBloodType,
    deleteRequest
};
