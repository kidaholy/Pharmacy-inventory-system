const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function fixSuperAdminPassword() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    const MultiTenantUser = mongoose.model('MultiTenantUser', new mongoose.Schema({}, { strict: false }));
    
    // Find the super admin user
    const superAdmin = await MultiTenantUser.findOne({ email: 'kidayos2014@gmail.com' });
    
    if (!superAdmin) {
      console.log('❌ Super admin user not found!');
      return;
    }
    
    console.log('👤 Found super admin:', superAdmin.email);
    console.log('🔍 Current password:', superAdmin.password);
    
    // Check if password is already hashed
    const isAlreadyHashed = /^\$2[aby]\$/.test(superAdmin.password);
    
    if (isAlreadyHashed) {
      console.log('ℹ️  Password is already hashed');
      
      // Test if the hashed password works with 'password'
      const isPasswordValid = await bcrypt.compare('password', superAdmin.password);
      console.log('🔍 Password verification test:', isPasswordValid ? 'PASS' : 'FAIL');
      
      if (!isPasswordValid) {
        console.log('🔧 Re-hashing password to ensure it works...');
        const newHashedPassword = await bcrypt.hash('password', 12);
        
        await MultiTenantUser.findByIdAndUpdate(superAdmin._id, {
          password: newHashedPassword,
          'security.lastPasswordChange': new Date()
        });
        
        console.log('✅ Password re-hashed successfully');
      }
    } else {
      console.log('🔐 Hashing plain text password...');
      
      // Hash the plain text password
      const hashedPassword = await bcrypt.hash('password', 12);
      
      // Update the user with hashed password
      await MultiTenantUser.findByIdAndUpdate(superAdmin._id, {
        password: hashedPassword,
        'security.lastPasswordChange': new Date()
      });
      
      console.log('✅ Password hashed successfully');
    }
    
    // Verify the final result
    const updatedSuperAdmin = await MultiTenantUser.findOne({ email: 'kidayos2014@gmail.com' });
    const finalTest = await bcrypt.compare('password', updatedSuperAdmin.password);
    
    console.log('🎉 Final verification test:', finalTest ? 'SUCCESS' : 'FAILED');
    
    if (finalTest) {
      console.log('✅ Super admin can now login with:');
      console.log('   Email: kidayos2014@gmail.com');
      console.log('   Password: password');
    } else {
      console.log('❌ Something went wrong. Please check the password setup.');
    }
    
  } catch (error) {
    console.error('❌ Error fixing super admin password:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

fixSuperAdminPassword();