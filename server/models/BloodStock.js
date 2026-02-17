const mongoose = require('mongoose');

const bloodStockSchema = new mongoose.Schema({
    bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
        required: true,
        unique: true
    },
    quantity: { type: Number, default: 0, min: 0 },
    lastUpdated: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin who updated it
});

module.exports = mongoose.model('BloodStock', bloodStockSchema);
