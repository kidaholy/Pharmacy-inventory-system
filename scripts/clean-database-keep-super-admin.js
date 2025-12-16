const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function cleanDatabaseKeepSuperAdmin() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    // Define all models with flexible schemas
    const Tenant = mongoose.model('Tenant', new mongoose.Schema({}, { strict: false }));
    const MultiTenantUser = mongoose.model('MultiTenantUser', new mongoose.Schema({}, { strict: false }));
    const Medicine = mongoose.model('Medicine', new mongoose.Schema({}, { strict: false }));
    const Prescription = mongoose.model('Prescription', new mongoose.Schema({}, { strict: false }));
    const Inventory = mongoose.model('Inventory', new mongoose.Schema({}, { strict: false }));
    const Sale = mongoose.model('Sale', new mongoose.Schema({}, { strict: false }));
    const Customer = mongoose.model('Customer', new mongoose.Schema({}, { strict: false }));
    const Supplier = mongoose.model('Supplier', new mongoose.Schema({}, { strict: false }));
    const Report = mongoose.model('Report', new mongoose.Schema({}, { strict: false }));
    const Notification = mongoose.model('Notification', new mongoose.Schema({}, { strict: false }));
    
    // Find the super admin before cleaning
    const superAdmin = await MultiTenantUser.findOne({ 
      email: 'kidayos2014@gmail.com',
      role: 'super_admin'
    });
    
    if (!superAdmin) {
      console.log('❌ Super admin not found! Please run setup-super-admin-only.js first');
      return;
    }
    
    console.log('👤 Found super admin:', superAdmin.email);
    
    // Clean all collections except super admin (no tenant needed for super admin)
    console.log('🧹 Cleaning database...');
    
    // Remove all users except super admin
    const deletedUsers = await MultiTenantUser.deleteMany({
      _id: { $ne: superAdmin._id }
    });
    console.log(`🗑️  Removed ${deletedUsers.deletedCount} users (kept super admin)`);
    
    // Remove ALL tenants (super admin doesn't need one)
    const deletedTenants = await Tenant.deleteMany({});
    console.log(`🗑️  Removed ${deletedTenants.deletedCount} tenants (super admin is tenant-independent)`);
    
    // Remove all other data
    const deletedMedicines = await Medicine.deleteMany({});
    console.log(`🗑️  Removed ${deletedMedicines.deletedCount} medicines`);
    
    const deletedPrescriptions = await Prescription.deleteMany({});
    console.log(`🗑️  Removed ${deletedPrescriptions.deletedCount} prescriptions`);
    
    const deletedInventory = await Inventory.deleteMany({});
    console.log(`🗑️  Removed ${deletedInventory.deletedCount} inventory items`);
    
    const deletedSales = await Sale.deleteMany({});
    console.log(`🗑️  Removed ${deletedSales.deletedCount} sales`);
    
    const deletedCustomers = await Customer.deleteMany({});
    console.log(`🗑️  Removed ${deletedCustomers.deletedCount} customers`);
    
    const deletedSuppliers = await Supplier.deleteMany({});
    console.log(`🗑️  Removed ${deletedSuppliers.deletedCount} suppliers`);
    
    const deletedReports = await Report.deleteMany({});
    console.log(`🗑️  Removed ${deletedReports.deletedCount} reports`);
    
    const deletedNotifications = await Notification.deleteMany({});
    console.log(`🗑️  Removed ${deletedNotifications.deletedCount} notifications`);
    
    // Verify what's left
    console.log('\n📊 Database status after cleanup:');
    console.log(`   Users: ${await MultiTenantUser.countDocuments()}`);
    console.log(`   Tenants: ${await Tenant.countDocuments()}`);
    console.log(`   Medicines: ${await Medicine.countDocuments()}`);
    console.log(`   Prescriptions: ${await Prescription.countDocuments()}`);
    console.log(`   Inventory: ${await Inventory.countDocuments()}`);
    console.log(`   Sales: ${await Sale.countDocuments()}`);
    console.log(`   Customers: ${await Customer.countDocuments()}`);
    console.log(`   Suppliers: ${await Supplier.countDocuments()}`);
    
    console.log('\n✅ Database cleaned successfully!');
    console.log('🔐 Super admin login:');
    console.log('   Email: kidayos2014@gmail.com');
    console.log('   Password: password');
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

cleanDatabaseKeepSuperAdmin();