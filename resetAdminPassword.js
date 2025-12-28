const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const resetAdminPassword = async () => {
    try {
        const email = 'admin@example.com';
        const newPassword = 'admin';

        let user = await User.findOne({ email });

        if (!user) {
            console.log('Admin user not found, creating new one...');
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(newPassword, salt);

            user = new User({
                name: 'Admin User',
                email,
                passwordHash,
                role: 'admin'
            });
            await user.save();
            console.log(`✅ Admin user created: ${email} / ${newPassword}`);
        } else {
            console.log('Admin user found, updating password...');
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(newPassword, salt);

            user.passwordHash = passwordHash;
            await user.save();

            // Verify the password works
            const isMatch = await bcrypt.compare(newPassword, user.passwordHash);
            console.log(`✅ Admin password updated: ${email} / ${newPassword}`);
            console.log(`✅ Password verification: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
        }

        process.exit();
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

resetAdminPassword();
