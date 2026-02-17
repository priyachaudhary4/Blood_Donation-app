const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    reply: { type: String }, // Admin's reply
    status: { type: String, enum: ['Open', 'Replied'], default: 'Open' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
});

module.exports = mongoose.model('SupportMessage', supportMessageSchema);
