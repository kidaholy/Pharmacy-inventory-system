const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function verifyCleanState() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    // Define models
    const Tenant = mongoose.model('Tenant', new mongoose.Schema({}, { strict: false }));
    const MultiTenantUser = mongoose.model('MultiTenantUser', new mongoose.Schema({}, { strict: false }));
    const Medicine = mongoose.model('Medicine', new mongoose.Schema({}, { strict: false }));
    const Prescription = mongoose.model('Prescription', new mongoose.Schema({}, { strict: false }));
    const Inventory = mongoose.model('Inventory', new mongoose.Schema({}, { strict: false }));
    const Sale = mongoose.model('Sale', new mongoose.Schema({}, { strict: false }));
    const Customer = mongoose.model('Customer', new mongoose.Schema({}, { strict: false }));
    const Supplier = mongoose.model('Supplier', new mongoose.Schema({}, { strict: false }));
    
    // Count all collections
    const counts = {
      users: await MultiTenantUser.countDocuments(),
      tenants: await Tenant.countDocuments(),
      medicines: await Medicine.countDocuments(),
      prescriptions: await Prescription.countDocuments(),
      inventory: await Inventory.countDocuments(),
      sales: await Sale.countDocuments(),
      customers: await Customer.countDocuments(),
      suppliers: await Supplier.countDocuments()
    };
    
    console.log('\n📊 Database State:');
    console.log(`   Users: ${counts.users}`);
    console.log(`   Tenants: ${counts.tenants}`);
    console.log(`   Medicines: ${counts.medicines}`);
    console.log(`   Prescriptions: ${counts.prescriptions}`);
    console.log(`   Inventory: ${counts.inventory}`);
    console.log(`   Sales: ${counts.sales}`);
    console.log(`   Customers: ${counts.customers}`);
    console.log(`   Suppliers: ${counts.suppliers}`);
    
    // Check super admin
    const superAdmin = await MultiTenantUser.findOne({ 
      email: 'kidayos2014@gmail.com',
      role: 'super_admin'
    });
    
    if (superAdmin) {
      console.log('\n👤 Super Admin Status:');
      console.log(`   Email: ${superAdmin.email}`);
      console.log(`   Role: ${superAdmin.role}`);
      console.log(`   Active: ${superAdmin.isActive}`);
      console.log(`   Tenant ID: ${superAdmin.tenantId || 'NONE (tenant-independent)'}`);
      
      if (superAdmin.tenantId) {
        console.log('   ⚠️  Super admin should be tenant-independent!');
      } else {
        console.log('   ✅ Super admin is properly tenant-independent');
      }
    } else {
      console.log('\n❌ Super admin not found!');
    }
    
    // Determine if system is clean
    const isClean = counts.users === 1 && 
                   counts.tenants === 0 && // No tenants needed for super admin
                   counts.medicines === 0 && 
                   counts.prescriptions === 0 && 
                   counts.inventory === 0 && 
                   counts.sales === 0 && 
                   counts.customers === 0 && 
                   counts.suppliers === 0 &&
                   superAdmin &&
                   !superAdmin.tenantId; // Super admin should be tenant-independent
    
    console.log(`\n${isClean ? '✅' : '❌'} System State: ${isClean ? 'CLEAN' : 'NOT CLEAN'}`);
    
    if (isClean) {
      console.log('\n🎉 Database is clean and ready!');
      console.log('🔐 Super admin login:');
      console.log('   Email: kidayos2014@gmail.com');
      console.log('   Password: password');
    }
    
  } catch (error) {
    console.error('❌ Error verifying state:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

verifyCleanState();