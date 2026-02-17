const express = require('express');
const router = express.Router();
const {
    getStats,
    getAllUsers,
    deleteUser
} = require('../controllers/adminController');
const {
    notifyDonor,
    createBulkRequest,
    getDonationRequests,
    updateDonationStatusAdmin,
    deleteDonationRequestAdmin
} = require('../controllers/donationRequestController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/stats', protect, authorize('admin'), getStats);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

// Notification Routes
router.post('/notify', protect, authorize('admin'), notifyDonor);
router.post('/bulk-request', protect, authorize('admin'), createBulkRequest);
router.get('/donation-requests', protect, authorize('admin'), getDonationRequests);
router.put('/donation-requests/:id/status', protect, authorize('admin'), updateDonationStatusAdmin);
router.delete('/donation-requests/:id', protect, authorize('admin'), deleteDonationRequestAdmin);

module.exports = router;
