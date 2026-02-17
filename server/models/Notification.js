const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['request', 'acceptance', 'rejection', 'completion', 'emergency', 'info'],
    default: 'info' 
  },
  isRead: { type: Boolean, default: false },
  relatedRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'DonationRequest' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
