require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorMiddleware');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route Files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bloodBankRoutes = require('./routes/bloodBankRoutes');
const requestRoutes = require('./routes/requestRoutes');
const adminRoutes = require('./routes/adminRoutes');
const donorRoutes = require('./routes/donorRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const supportRoutes = require('./routes/supportRoutes');
const bloodDriveRoutes = require('./routes/bloodDriveRoutes');

// Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blood-bank', bloodBankRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/drives', bloodDriveRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Dev route to view mock emails
const { getEmail } = require('./utils/emailService');
app.get('/dev/email/:id', (req, res) => {
  const email = getEmail(req.params.id);
  if (!email) return res.status(404).send('Email not found (Server restarted?)');
  res.send(`
        <div style="font-family: sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #ccc; padding: 20px; border-radius: 8px;">
            <div style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px;">
                <div><strong>To:</strong> ${email.to}</div>
                <div><strong>Subject:</strong> ${email.subject}</div>
                <div style="color: #666; font-size: 12px; margin-top: 5px;">${email.date.toLocaleString()}</div>
            </div>
            <div style="white-space: pre-wrap;">${email.html}</div>
        </div>
    `);
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
