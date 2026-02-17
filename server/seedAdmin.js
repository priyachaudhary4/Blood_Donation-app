require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/database');

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminExists = await User.findOne({ email: 'admin@example.com' });

        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const adminUser = await User.create({
            name: 'System Admin',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin',
            phone: '1234567890',
            bloodType: 'O+', // Required by schema but not relevant for admin validation usually
            address: 'Admin HQ',
            city: 'Central City'
        });

        console.log('Admin user created successfully:', adminUser);
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
