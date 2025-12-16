const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function testRegistration() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    const Tenant = mongoose.model('Tenant', new mongoose.Schema({}, { strict: false }));
    const MultiTenantUser = mongoose.model('MultiTenantUser', new mongoose.Schema({}, { strict: false }));
    
    // Test registration API call
    console.log('🧪 Testing registration API...');
    
    const testData = {
      // Personal Details
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@testpharmacy.com',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
      
      // Pharmacy Details
      pharmacyName: 'Test Pharmacy',
      subdomain: 'test-pharmacy',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      country: 'Test Country',
      postalCode: '12345',
      phone: '+1-555-123-4567',
      pharmacyEmail: 'info@testpharmacy.com',
      
      subscriptionPlan: 'starter'
    };
    
    console.log('📝 Test registration data:', testData);
    
    // Make API call to registration endpoint
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Registration API test successful!');
      console.log('📋 Created tenant:', result.tenant);
      console.log('👤 Created admin:', result.admin);
      
      // Verify in database
      const tenant = await Tenant.findById(result.tenant._id);
      const admin = await MultiTenantUser.findById(result.admin._id);
      
      console.log('🔍 Database verification:');
      console.log('   Tenant in DB:', !!tenant);
      console.log('   Tenant subdomain:', tenant?.subdomain);
      console.log('   Tenant name:', tenant?.name);
      console.log('   Admin in DB:', !!admin);
      console.log('   Admin email:', admin?.email);
      console.log('   Admin tenant ID:', admin?.tenantId?.toString());
      console.log('   Tenant-Admin link:', tenant?._id?.toString() === admin?.tenantId?.toString());
      
    } else {
      console.log('❌ Registration API test failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

// Only run if server is running
console.log('⚠️  Make sure your Next.js server is running (npm run dev) before running this test!');
console.log('🚀 Starting registration test in 3 seconds...');

setTimeout(testRegistration, 3000);