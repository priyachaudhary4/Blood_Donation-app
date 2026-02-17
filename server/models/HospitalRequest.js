const mongoose = require('mongoose');

const hospitalRequestSchema = new mongoose.Schema({
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    hospitalName: { type: String, required: true }, // For manual entry or populated from User
    bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
        required: true
    },
    unitsNeeded: { type: Number, required: true, min: 1 },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending'
    },
    urgency: {
        type: String,
        enum: ['normal', 'urgent', 'critical'],
        default: 'normal'
    },
    requestDate: { type: Date, default: Date.now },
    resolvedDate: { type: Date },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin who approved/rejected
});

module.exports = mongoose.model('HospitalRequest', hospitalRequestSchema);
