const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  console.log('🔗 Testing MongoDB Atlas connection...');
  console.log('📍 URI:', MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@'));
  
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 10000,
  });
  
  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas');
    
    // Test database access
    const db = client.db('pharmacy');
    const collections = await db.listCollections().toArray();
    console.log('📋 Current collections:', collections.map(c => c.name));
    
    // Test a simple operation
    const result = await db.admin().ping();
    console.log('🏓 Ping result:', result);
    
    console.log('🎉 Connection test successful!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    // Try alternative connection methods
    console.log('🔄 Trying alternative connection...');
    
    const altClient = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    try {
      await altClient.connect();
      console.log('✅ Alternative connection successful!');
      await altClient.close();
    } catch (altError) {
      console.error('❌ Alternative connection also failed:', altError.message);
    }
    
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

testConnection();