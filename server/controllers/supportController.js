const asyncHandler = require('express-async-handler');
const SupportMessage = require('../models/SupportMessage');

// @desc    Create a new support message (Donor)
// @route   POST /api/support
// @access  Private (Donor)
const createMessage = asyncHandler(async (req, res) => {
    const { message } = req.body;

    const supportMessage = await SupportMessage.create({
        senderId: req.user._id,
        message
    });

    res.status(201).json({ success: true, data: supportMessage });
});

// @desc    Get all support messages (Admin)
// @route   GET /api/support/admin
// @access  Private (Admin)
const getMessagesAdmin = asyncHandler(async (req, res) => {
    const messages = await SupportMessage.find()
        .populate('senderId', 'name email bloodType') // Get donor info
        .sort({ createdAt: -1 });

    res.json({ success: true, data: messages });
});

// @desc    Reply to a message (Admin)
// @route   PUT /api/support/admin/:id/reply
// @access  Private (Admin)
const replyToMessage = asyncHandler(async (req, res) => {
    const { reply } = req.body;
    const message = await SupportMessage.findById(req.params.id);

    if (!message) {
        return res.status(404).json({ success: false, message: 'Message not found' });
    }

    message.reply = reply;
    message.status = 'Replied';
    message.updatedAt = Date.now();
    await message.save();

    res.json({ success: true, data: message });
});

// @desc    Get my support messages (Donor)
// @route   GET /api/support/my
// @access  Private (Donor)
const getMyMessages = asyncHandler(async (req, res) => {
    const messages = await SupportMessage.find({ senderId: req.user._id })
        .sort({ createdAt: -1 });

    res.json({ success: true, data: messages });
});

module.exports = {
    createMessage,
    getMessagesAdmin,
    replyToMessage,
    getMyMessages
};
