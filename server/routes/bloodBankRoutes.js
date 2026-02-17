const express = require('express');
const router = express.Router();
const {
    getStock,
    updateStock,
    createRequest,
    getRequests,
    updateRequestStatus,
    completeHospitalRequest,
    getDonorsByBloodType,
    deleteRequest
} = require('../controllers/bloodBankController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public/Protected routes
router.get('/stock', protect, getStock);

// Hospital/Recipient routes
router.post('/requests', protect, authorize('hospital', 'admin', 'recipient'), createRequest);
router.get('/requests', protect, authorize('admin', 'hospital', 'recipient'), getRequests);

// Admin routes
router.put('/stock', protect, authorize('admin'), updateStock);
router.put('/requests/:id', protect, authorize('admin'), updateRequestStatus);
router.put('/requests/:id/complete', protect, authorize('hospital', 'recipient', 'admin'), completeHospitalRequest);
router.delete('/requests/:id', protect, authorize('admin'), deleteRequest);
router.get('/donors/:bloodType', protect, authorize('admin'), getDonorsByBloodType);

module.exports = router;
