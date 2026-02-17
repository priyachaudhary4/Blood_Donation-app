const Notification = require('../models/Notification');

const createNotification = async (userId, title, message, type = 'info', relatedRequestId = null) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      relatedRequestId,
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

module.exports = { createNotification };
