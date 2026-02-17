const mongoose = require('mongoose');

const bloodDriveSchema = new mongoose.Schema({
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin or Hospital
    title: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    location: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    description: { type: String },
    bloodTypes: [{ type: String }], // targeted types
    status: {
        type: String,
        enum: ['Upcoming', 'Completed', 'Cancelled'],
        default: 'Upcoming'
    },
    attendees: [{
        donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['Registered', 'Attended', 'Missed'], default: 'Registered' },
        registeredAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BloodDrive', bloodDriveSchema);
