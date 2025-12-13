import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://kidayos2014:holyunion@cluster0.5b5mudf.mongodb.net/pharmasuite';

const UserSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  isActive: { type: Boolean, default: true },
  permissions: [{ type: String }],
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@pharmacy.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@pharmacy.com');
      console.log('Password: admin123');
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await User.create({
      tenantId: 'default',
      name: 'Admin User',
      email: 'admin@pharmacy.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      permissions: ['all'],
    });

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('Login Credentials:');
    console.log('Email: admin@pharmacy.com');
    console.log('Password: admin123');
    console.log('');
    console.log('⚠️  Please change the password after first login!');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();