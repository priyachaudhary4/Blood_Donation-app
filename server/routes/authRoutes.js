const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  refreshToken,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateRegister } = require('../middleware/validationMiddleware');

router.post('/register', validateRegister, register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/refresh', refreshToken);

module.exports = router;
