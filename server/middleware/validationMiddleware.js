const { validateEmail, validatePhone } = require('../utils/validation');

const validateRegister = (req, res, next) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password || !phone || !role) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields',
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters',
    });
  }

  if (!validatePhone(phone)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid phone number',
    });
  }

  next();
};

module.exports = { validateRegister };
