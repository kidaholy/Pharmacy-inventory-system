const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function migratePasswords() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    const MultiTenantUser = mongoose.model('MultiTenantUser', new mongoose.Schema({}, { strict: false }));
    
    // Get all users
    const users = await MultiTenantUser.find({});
    console.log(`📋 Found ${users.length} users to check`);
    
    let migratedCount = 0;
    
    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
      const isAlreadyHashed = /^\$2[aby]\$/.test(user.password);
      
      if (!isAlreadyHashed) {
        console.log(`🔐 Migrating password for user: ${user.email}`);
        
        // Hash the plain text password
        const hashedPassword = await bcrypt.hash(user.password, 12);
        
        // Update the user with hashed password
        await MultiTenantUser.findByIdAndUpdate(user._id, {
          password: hashedPassword,
          'security.lastPasswordChange': new Date()
        });
        
        migratedCount++;
        console.log(`   ✅ Password hashed for ${user.email}`);
      } else {
        console.log(`   ℹ️  Password already hashed for ${user.email}`);
      }
    }
    
    console.log(`🎉 Password migration completed!`);
    console.log(`   Total users: ${users.length}`);
    console.log(`   Migrated: ${migratedCount}`);
    console.log(`   Already hashed: ${users.length - migratedCount}`);
    
    if (migratedCount > 0) {
      console.log('');
      console.log('🔒 All passwords are now securely hashed with bcrypt!');
      console.log('⚠️  Users can continue using their existing passwords - they will work normally.');
    }
    
  } catch (error) {
    console.error('❌ Error migrating passwords:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

migratePasswords();