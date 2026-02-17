const validator = require('validator');

const validateEmail = (email) => {
  return validator.isEmail(email);
};

const validatePhone = (phone) => {
  return validator.isMobilePhone(phone, 'any', { strictMode: false });
};

const validateBloodType = (bloodType) => {
  const validTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  return validTypes.includes(bloodType);
};

module.exports = { validateEmail, validatePhone, validateBloodType };
