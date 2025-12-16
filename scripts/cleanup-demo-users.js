const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function cleanupDemoUsers() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    // Get all users
    const MultiTenantUser = mongoose.model('MultiTenantUser', new mongoose.Schema({}, { strict: false }));
    const allUsers = await MultiTenantUser.find({});
    
    console.log('📋 Current users:');
    allUsers.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
    });
    
    // Keep only super admin
    const usersToKeep = [
      'kidayos2014@gmail.com' // Super admin only
    ];
    
    console.log('🔒 Protected users (will not be deleted):');
    usersToKeep.forEach(email => console.log(`   - ${email}`));
    
    // Delete all other users including demo users
    const deleteResult = await MultiTenantUser.deleteMany({
      email: { $nin: usersToKeep }
    });
    
    console.log('🗑️  Deleted', deleteResult.deletedCount, 'demo users');
    
    // Show remaining users
    const remainingUsers = await MultiTenantUser.find({});
    console.log('📋 Remaining users:');
    remainingUsers.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
    });
    
    console.log('🎉 Demo data cleanup completed!');
    console.log('');
    console.log('🔐 Available Login Credentials:');
    console.log('   Super Admin:');
    console.log('     Email: kidayos2014@gmail.com');
    console.log('     Password: password');
    console.log('');
    console.log('ℹ️  All demo data has been removed. Only the super admin remains.');
    
  } catch (error) {
    console.error('❌ Error cleaning up demo users:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

cleanupDemoUsers();