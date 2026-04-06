const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load environment variables from the server root directory
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const createAdmin = async () => {
    try {
        // Check for required arguments
        const args = process.argv.slice(2);

        if (args.length < 3) {
            console.log('\nUsage: node server/scripts/createAdmin.js <Name> <Email> <Password> [Phone]');
            console.log('Example: node server/scripts/createAdmin.js "Admin User" admin@example.com mysecurepassword "1234567890"\n');
            process.exit(1);
        }

        const [name, email, password, phone = '1234567890'] = args;

        // Connect to MongoDB
        if (!process.env.MONGODB_URI) {
            console.error('Error: MONGODB_URI is not defined in .env file');
            console.error(`Checked path: ${envPath}`);
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.error(`\nError: User with email ${email} already exists.`);
            process.exit(1);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create admin user
        const adminUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            phone,
            isAvailable: true,
            bloodType: '', // Not relevant for admin
            address: 'System Admin Address',
            city: 'System Admin City',
        });

        console.log('\n----------------------------------------');
        console.log('✅ Admin Account Created Successfully!');
        console.log('----------------------------------------');
        console.log(`Name:     ${adminUser.name}`);
        console.log(`Email:    ${adminUser.email}`);
        console.log(`Role:     ${adminUser.role}`);
        console.log('----------------------------------------\n');

        // Close connection
        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error creating admin account:', error.message);
        process.exit(1);
    }
};

createAdmin();
