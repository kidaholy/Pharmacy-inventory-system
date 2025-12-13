const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://kidayos2014:holyunion@cluster0.5b5mudf.mongodb.net/pharmasuite';

const UserSchema = new mongoose.Schema({
  tenantId: String,
  name: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
  permissions: [String],
}, { timestamps: true });

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', UserSchema);

    // Check if admin exists
    const existing = await User.findOne({ email: 'admin@pharmacy.com' });
    
    if (existing) {
      console.log('\n⚠️  Admin user already exists!');
      console.log('\n📧 Email: admin@pharmacy.com');
      console.log('🔑 Password: admin123\n');
      await mongoose.disconnect();
      return;
    }

    // Create admin
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

    console.log('\n✅ Admin user created successfully!\n');
    console.log('═══════════════════════════════════');
    console.log('   LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════');
    console.log('📧 Email:    admin@pharmacy.com');
    console.log('🔑 Password: admin123');
    console.log('═══════════════════════════════════\n');
    console.log('⚠️  Please change the password after first login!\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();