const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function testPharmacyRegistration() {
  try {
    console.log('🧪 Testing pharmacy registration flow...');
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    // Test registration via API call
    const registrationData = {
      // Pharmacy Details
      pharmacyName: 'Test Pharmacy',
      subdomain: 'test-pharmacy',
      address: '123 Main Street',
      city: 'Test City',
      state: 'Test State',
      country: 'Test Country',
      postalCode: '12345',
      phone: '+1234567890',
      pharmacyEmail: 'pharmacy@test.com',
      
      // Owner Details
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
      
      subscriptionPlan: 'professional'
    };
    
    console.log('📝 Attempting registration with data:', {
      pharmacyName: registrationData.pharmacyName,
      subdomain: registrationData.subdomain,
      ownerEmail: registrationData.email,
      plan: registrationData.subscriptionPlan
    });
    
    // Make API call to registration endpoint
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Registration successful!');
      console.log('🏥 Tenant created:', result.tenant.name);
      console.log('👤 Admin created:', result.admin.email);
      
      // Test login
      console.log('🔐 Testing login...');
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registrationData.email,
          password: registrationData.password
        }),
      });
      
      const loginResult = await loginResponse.json();
      
      if (loginResult.success) {
        console.log('✅ Login successful!');
        console.log('👤 User data:', {
          email: loginResult.user.email,
          name: `${loginResult.user.firstName} ${loginResult.user.lastName}`,
          role: loginResult.user.role,
          tenantId: loginResult.user.tenantId
        });
        
        // Test tenant data retrieval
        console.log('🏥 Testing tenant data retrieval...');
        const tenantResponse = await fetch(`http://localhost:3000/api/tenant/${loginResult.user.tenantId}`);
        const tenantData = await tenantResponse.json();
        
        if (tenantResponse.ok) {
          console.log('✅ Tenant data retrieved successfully!');
          console.log('🏥 Tenant info:', {
            name: tenantData.name,
            subdomain: tenantData.subdomain,
            plan: tenantData.subscriptionPlan,
            city: tenantData.contact.city,
            country: tenantData.contact.country
          });
        } else {
          console.log('❌ Failed to retrieve tenant data:', tenantData.error);
        }
        
      } else {
        console.log('❌ Login failed:', loginResult.error);
      }
      
    } else {
      console.log('❌ Registration failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

// Only run if this script is called directly
if (require.main === module) {
  testPharmacyRegistration();
}

module.exports = { testPharmacyRegistration };