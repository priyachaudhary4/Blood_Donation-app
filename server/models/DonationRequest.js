const mongoose = require('mongoose');

const donationRequestSchema = new mongoose.Schema({
  // requesterId is used by Admin/donationRequestController
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // recipientId/hospitalId are used by requestController
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    required: true
  },
  unitsNeeded: { type: Number, default: 1 },
  urgency: { type: String, default: 'normal' }, // normal, high, critical
  patientName: { type: String },
  contactPhone: { type: String },
  message: { type: String }, // Made optional as some flows might not provide it, or ensure default

  type: { type: String, enum: ['Individual', 'Broadcast', 'Drive'], default: 'Individual' },

  status: {
    type: String,
    // Supporting both TitleCase (legacy/Admin) and lowercase (new/Hospital)
    enum: ['Pending', 'Accepted', 'Declined', 'Completed', 'pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },

  requestDate: { type: Date, default: Date.now },
  acceptedAt: { type: Date },
  completedAt: { type: Date },

  scheduledDate: { type: Date },
  location: { type: String },
  startTime: { type: String },
  endTime: { type: String },
  latitude: { type: Number },
  longitude: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('DonationRequest', donationRequestSchema);
