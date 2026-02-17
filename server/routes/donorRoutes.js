const express = require('express');
const router = express.Router();
const { getMyDonationRequests, updateDonationRequestStatus } = require('../controllers/donationRequestController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/requests', protect, authorize('donor'), getMyDonationRequests);

router.put('/requests/:id/status', protect, authorize('donor'), updateDonationRequestStatus);

module.exports = router;
