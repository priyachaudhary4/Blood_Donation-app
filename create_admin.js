const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./server/models/User');
require('dotenv').config({ path: './server/.env' });

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'admin@lifelink.com';
        const password = 'adminpassword123';

        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            console.log('Admin already exists:', email);
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            name: 'Central Admin',
            email,
            password: hashedPassword,
            role: 'admin',
            phone: '0000000000',
        });

        console.log('Admin created successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
