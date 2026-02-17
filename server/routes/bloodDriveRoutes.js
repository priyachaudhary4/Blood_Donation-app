const express = require('express');
const router = express.Router();
const {
    createDrive,
    getDrives,
    getMyDrives,
    registerForDrive
} = require('../controllers/bloodDriveController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public/All (Protected)
router.get('/', protect, getDrives);

// Admin/Hospital
router.post('/', protect, authorize('admin', 'hospital'), createDrive);
router.get('/my-drives', protect, authorize('admin', 'hospital'), getMyDrives);

// Donor
router.put('/:id/register', protect, authorize('donor'), registerForDrive);

module.exports = router;
