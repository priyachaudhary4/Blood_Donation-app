const express = require('express');
const router = express.Router();
const {
    createMessage,
    getMessagesAdmin,
    replyToMessage,
    getMyMessages
} = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Donor Routes
router.post('/', protect, createMessage);
router.get('/my', protect, getMyMessages);

// Admin Routes
router.get('/admin', protect, authorize('admin'), getMessagesAdmin);
router.put('/admin/:id/reply', protect, authorize('admin'), replyToMessage);

module.exports = router;
