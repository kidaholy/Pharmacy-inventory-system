#!/usr/bin/env node

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmatrack';

async function setupMongoDB() {
  console.log('🚀 Setting up MongoDB for PharmaTrack...');
  console.log(`📍 Connecting to: ${MONGODB_URI}`);

  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('pharmatrack');
    console.log('✅ Connected to MongoDB successfully!');

    // Create collections with indexes
    console.log('📋 Creating collections and indexes...');
    
    // Users collection
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ username: 1 }, { unique: true });
    await usersCollection.createIndex({ role: 1 });
    console.log('✅ Users collection and indexes created');

    // Pharmacies collection
    const pharmaciesCollection = db.collection('pharmacies');
    await pharmaciesCollection.createIndex({ ownerId: 1 });
    await pharmaciesCollection.createIndex({ email: 1 });
    await pharmaciesCollection.createIndex({ subscriptionPlan: 1 });
    console.log('✅ Pharmacies collection and indexes created');

    // Check if data already exists
    const userCount = await usersCollection.countDocuments();
    const pharmacyCount = await pharmaciesCollection.countDocuments();

    if (userCount === 0 && pharmacyCount === 0) {
      console.log('📦 Initializing sample data...');
      
      // Create super admin
      await usersCollection.insertOne({
        username: 'superadmin',
        email: 'superadmin@pharmatrack.com',
        password: 'SuperAdmin123!',
        role: 'super_admin',
        createdAt: new Date(),
        isActive: true
      });

      // Create demo user
      await usersCollection.insertOne({
        username: 'demo_admin',
        email: 'admin@pharmatrack.com',
        password: 'password',
        role: 'admin',
        createdAt: new Date(),
        isActive: true
      });

      console.log('✅ Sample data initialized');
    } else {
      console.log(`📊 Database already contains ${userCount} users and ${pharmacyCount} pharmacies`);
    }

    console.log('🎉 MongoDB setup completed successfully!');
    console.log('');
    console.log('📝 Login Credentials:');
    console.log('   Super Admin: superadmin@pharmatrack.com / SuperAdmin123!');
    console.log('   Demo User: admin@pharmatrack.com / password');
    console.log('');
    console.log('🌐 You can now start your Next.js application');

  } catch (error) {
    console.error('❌ MongoDB setup failed:', error.message);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('   1. Make sure MongoDB is running on localhost:27017');
    console.log('   2. Check if MongoDB service is started');
    console.log('   3. Verify connection string in MONGODB_URI');
    console.log('');
    console.log('🔄 The application will fallback to localStorage if MongoDB is unavailable');
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run setup
setupMongoDB();