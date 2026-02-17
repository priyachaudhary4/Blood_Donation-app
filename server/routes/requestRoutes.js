const express = require('express');
const router = express.Router();
const {
  createRequest,
  getMyRequests,
  getPendingRequests,
  acceptRequest,
  rejectRequest,
  completeRequest,
  emergencyBroadcast,
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('recipient', 'hospital'), createRequest);
router.get('/my-requests', protect, getMyRequests);
router.get('/pending', protect, authorize('donor'), getPendingRequests);
router.put('/:id/accept', protect, authorize('donor'), acceptRequest);
router.put('/:id/reject', protect, authorize('donor'), rejectRequest);
router.put('/:id/complete', protect, completeRequest);
router.post('/emergency', protect, authorize('hospital'), emergencyBroadcast);

module.exports = router;
