#!/usr/bin/env node

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://kidayos2014:holyunion@cluster0.5b5mudf.mongodb.net/pharmatrack?retryWrites=true&w=majority';

async function testAtlasConnection() {
  console.log('🚀 Testing MongoDB Atlas connection...');
  console.log(`📍 Connecting to: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);

  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    
    console.log('✅ Connected to MongoDB Atlas successfully!');

    // Test basic operations
    const db = mongoose.connection.db;
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections:`, collections.map(c => c.name));

    // Test a simple operation
    const testCollection = db.collection('test');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    const testDoc = await testCollection.findOne({ test: true });
    console.log('📝 Test document created:', testDoc ? 'Success' : 'Failed');
    
    // Clean up test document
    await testCollection.deleteOne({ test: true });
    console.log('🧹 Test document cleaned up');

    console.log('🎉 MongoDB Atlas connection test completed successfully!');
    console.log('');
    console.log('🌐 Your Next.js application can now connect to Atlas');
    console.log('📊 Database: pharmatrack');
    console.log('🔗 Connection string configured in .env.local');

  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:', error.message);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('   1. Check your internet connection');
    console.log('   2. Verify the connection string is correct');
    console.log('   3. Ensure your IP is whitelisted in Atlas');
    console.log('   4. Check username and password');
    console.log('');
    console.log('🔄 The application will fallback to localStorage if Atlas is unavailable');
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run test
testAtlasConnection();