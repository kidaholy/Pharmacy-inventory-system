const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

// Define MultiTenantUser schema
const MultiTenantUserSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  role: { 
    type: String, 
    enum: ['super_admin', 'admin', 'pharmacist', 'cashier', 'viewer'], 
    required: true 
  },
  permissions: [{
    type: String,
    enum: [
      'manage_users', 'manage_medicines', 'manage_prescriptions', 
      'view_reports', 'manage_settings', 'manage_billing',
      'dispense_medicines', 'create_prescriptions', 'view_inventory'
    ]
  }],
  profile: {
    phone: String,
    address: String,
    city: String,
    country: String,
    avatar: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] }
  },
  employment: {
    position: String,
    department: String,
    hireDate: { type: Date, default: Date.now },
    salary: Number,
    licenseNumber: String
  },
  security: {
    lastLogin: Date,
    failedLoginAttempts: { type: Number, default: 0 },
    accountLockedUntil: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String
  },
  preferences: {
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    }
  },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false }
}, { timestamps: true });

async function createSuperAdmin() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    // Get the sample tenant
    const Tenant = mongoose.model('Tenant', new mongoose.Schema({}, { strict: false }));
    const tenant = await Tenant.findOne({ subdomain: 'demo-pharmacy' });
    
    if (!tenant) {
      console.error('❌ Demo tenant not found. Please run npm run db:setup first.');
      return;
    }
    
    console.log('📋 Found tenant:', tenant.name, '(ID:', tenant._id + ')');
    
    // Create MultiTenantUser model
    const MultiTenantUser = mongoose.model('MultiTenantUser', MultiTenantUserSchema);
    
    // Check if super admin already exists
    const existingSuperAdmin = await MultiTenantUser.findOne({ 
      tenantId: tenant._id, 
      role: 'super_admin' 
    });
    
    if (existingSuperAdmin) {
      console.log('ℹ️  Super admin already exists:', existingSuperAdmin.email);
      console.log('👤 Name:', existingSuperAdmin.firstName, existingSuperAdmin.lastName);
      console.log('🔑 Role:', existingSuperAdmin.role);
      return;
    }
    
    // Create super admin user
    console.log('👤 Creating super admin user...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('password', 12);
    
    const superAdmin = new MultiTenantUser({
      tenantId: tenant._id,
      username: 'superadmin',
      email: 'kidayos2014@gmail.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      permissions: [
        'manage_users', 'manage_medicines', 'manage_prescriptions', 
        'view_reports', 'manage_settings', 'manage_billing',
        'dispense_medicines', 'create_prescriptions', 'view_inventory'
      ],
      profile: {
        phone: '+1234567890',
        city: 'Demo City',
        country: 'Demo Country'
      },
      employment: {
        position: 'Super Administrator',
        department: 'Management',
        hireDate: new Date()
      },
      security: {
        failedLoginAttempts: 0,
        twoFactorEnabled: false
      },
      preferences: {
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          sms: false,
          push: true
        }
      },
      isActive: true,
      isEmailVerified: true
    });
    
    const savedSuperAdmin = await superAdmin.save();
    console.log('✅ Created super admin:', savedSuperAdmin._id);
    
    // Also create a regular admin user
    console.log('👤 Creating regular admin user...');
    
    // Hash the regular admin password
    const hashedAdminPassword = await bcrypt.hash('pharmacist123', 12);
    
    const regularAdmin = new MultiTenantUser({
      tenantId: tenant._id,
      username: 'pharmacist',
      email: 'pharmacist@demopharmacy.com',
      password: hashedAdminPassword,
      firstName: 'John',
      lastName: 'Pharmacist',
      role: 'admin',
      permissions: [
        'manage_medicines', 'manage_prescriptions', 
        'view_reports', 'dispense_medicines', 'create_prescriptions', 'view_inventory'
      ],
      profile: {
        phone: '+1234567891',
        city: 'Demo City',
        country: 'Demo Country'
      },
      employment: {
        position: 'Head Pharmacist',
        department: 'Pharmacy',
        hireDate: new Date(),
        licenseNumber: 'PH123456'
      },
      isActive: true,
      isEmailVerified: true
    });
    
    const savedAdmin = await regularAdmin.save();
    console.log('✅ Created regular admin:', savedAdmin._id);
    
    // List all users
    const allUsers = await MultiTenantUser.find({ tenantId: tenant._id });
    console.log('📋 All users in tenant:');
    allUsers.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
    });
    
    console.log('🎉 Super admin setup completed successfully!');
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('   Super Admin:');
    console.log('     Email: kidayos2014@gmail.com');
    console.log('     Password: password');
    console.log('   Regular Admin:');
    console.log('     Email: pharmacist@demopharmacy.com');
    console.log('     Password: pharmacist123');
    console.log('');
    console.log('⚠️  Remember to change these passwords in production!');
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

createSuperAdmin();