const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function inspectSuperAdmin() {
  try {
    console.log('🔍 Inspecting super admin record...');
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    const MultiTenantUser = mongoose.model('MultiTenantUser', new mongoose.Schema({}, { strict: false }));
    
    // Find the super admin
    const superAdmin = await MultiTenantUser.findOne({ 
      email: 'kidayos2014@gmail.com',
      role: 'super_admin'
    });
    
    if (superAdmin) {
      console.log('👤 Super Admin Record:');
      console.log('   Email:', superAdmin.email);
      console.log('   Role:', superAdmin.role);
      console.log('   TenantId (raw):', superAdmin.tenantId);
      console.log('   TenantId type:', typeof superAdmin.tenantId);
      console.log('   TenantId is null:', superAdmin.tenantId === null);
      console.log('   TenantId is undefined:', superAdmin.tenantId === undefined);
      
      if (superAdmin.tenantId && superAdmin.tenantId.toString() === '000000000000000000000000') {
        console.log('⚠️  Found placeholder tenantId! Fixing...');
        
        await MultiTenantUser.findByIdAndUpdate(superAdmin._id, {
          $unset: { tenantId: 1 } // Remove the field completely
        });
        
        console.log('✅ Removed tenantId from super admin');
        
        // Verify the fix
        const updatedSuperAdmin = await MultiTenantUser.findById(superAdmin._id);
        console.log('✅ Verification - TenantId after fix:', updatedSuperAdmin.tenantId);
        console.log('✅ Verification - TenantId is undefined:', updatedSuperAdmin.tenantId === undefined);
      } else if (superAdmin.tenantId === null || superAdmin.tenantId === undefined) {
        console.log('✅ Super admin is properly tenant-independent');
      } else {
        console.log('⚠️  Super admin has unexpected tenantId:', superAdmin.tenantId);
      }
      
    } else {
      console.log('❌ Super admin not found!');
    }
    
  } catch (error) {
    console.error('❌ Error inspecting super admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

inspectSuperAdmin();