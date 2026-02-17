const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['donor', 'recipient', 'hospital', 'admin'], required: true },
  phone: { type: String, required: true },

  // Donor-specific
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', ''],
    default: ''
  },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  lastDonation: { type: Date },

  // Hospital-specific
  hospitalName: { type: String, default: '' },
  licenseNumber: { type: String, default: '' },

  // System
  profilePicture: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
