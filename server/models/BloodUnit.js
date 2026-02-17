const mongoose = require('mongoose');

const bloodUnitSchema = new mongoose.Schema({
    bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
        required: true
    },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional if manual
    manualDonorName: { type: String }, // For non-registered donors
    manualDonorPhone: { type: String }, // For non-registered donors
    status: {
        type: String,
        enum: ['Available', 'Reserved', 'Used', 'Expired'],
        default: 'Available'
    },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // If reserved/used
    donationDate: { type: Date, default: Date.now },
    expiryDate: { type: Date } // Could calculate this (e.g. +42 days)
});

// Calculate expiry before saving if not present
bloodUnitSchema.pre('save', function (next) {
    if (!this.expiryDate) {
        const date = new Date(this.donationDate);
        date.setDate(date.getDate() + 42); // Standard 42 days shelf life
        this.expiryDate = date;
    }
    next();
});

module.exports = mongoose.model('BloodUnit', bloodUnitSchema);
