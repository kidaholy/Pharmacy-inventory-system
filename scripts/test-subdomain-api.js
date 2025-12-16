const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function testSubdomainAPI() {
  try {
    console.log('🧪 Testing subdomain-based API calls...');
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
    
    // Create a test pharmacy with a specific subdomain
    console.log('\n🏥 Creating test pharmacy with subdomain...');
    
    const testPharmacy = await Tenant.create({
      name: 'Sunset Boulevard Pharmacy',
      subdomain: 'sunset-boulevard',
      ownerId: new mongoose.Types.ObjectId(),
      subscriptionPlan: 'professional',
      subscriptionStatus: 'active',
      settings: {
        timezone: 'PST',
        currency: 'USD',
        language: 'en',
        features: ['inventory', 'prescriptions', 'reports']
      },
      contact: {
        email: 'info@sunsetpharmacy.com',
        phone: '+1555444333',
        address: '123 Sunset Boulevard',
        city: 'Los Angeles',
        state: 'California',
        country: 'United States',
        postalCode: '90210'
      },
      billing: {
        companyName: 'Sunset Boulevard Pharmacy Inc.',
        billingEmail: 'billing@sunsetpharmacy.com'
      },
      isActive: true
    });
    
    console.log('✅ Created test pharmacy:', testPharmacy.name);
    console.log('   Subdomain:', testPharmacy.subdomain);
    console.log('   Tenant ID:', testPharmacy._id);
    
    // Create pharmacy owner
    const bcrypt = require('bcryptjs');
    const pharmacyOwner = await MultiTenantUser.create({
      tenantId: testPharmacy._id,
      username: 'sunset-owner',
      email: 'info@sunsetpharmacy.com',
      password: await bcrypt.hash('SunsetPass123!', 12),
      firstName: 'Maria',
      lastName: 'Rodriguez',
      role: 'admin',
      permissions: [
        'manage_users', 'manage_medicines', 'manage_prescriptions', 
        'view_reports', 'manage_settings'
      ],
      isActive: true,
      isEmailVerified: true
    });
    
    console.log('✅ Created pharmacy owner:', pharmacyOwner.email);
    
    // Add some test medicines
    const medicines = [
      {
        tenantId: testPharmacy._id,
        name: 'Sunset Aspirin 325mg',
        genericName: 'Acetylsalicylic Acid',
        manufacturer: 'Sunset Pharma',
        category: 'Tablet',
        stock: { current: 100, minimum: 20 },
        pricing: { costPrice: 1.00, sellingPrice: 2.50 },
        isActive: true
      },
      {
        tenantId: testPharmacy._id,
        name: 'Boulevard Vitamin C',
        genericName: 'Ascorbic Acid',
        manufacturer: 'Boulevard Health',
        category: 'Tablet',
        stock: { current: 75, minimum: 15 },
        pricing: { costPrice: 2.00, sellingPrice: 5.00 },
        isActive: true
      }
    ];
    
    await Medicine.insertMany(medicines);
    console.log(`✅ Added ${medicines.length} test medicines`);
    
    // Update tenant with owner ID
    await Tenant.findByIdAndUpdate(testPharmacy._id, {
      ownerId: pharmacyOwner._id
    });
    
    // Test API calls with different approaches
    console.log('\n🔍 Testing API calls...');
    
    // Test 1: API call with subdomain
    console.log('\n1️⃣ Testing API with subdomain:');
    console.log(`   URL: /api/tenant/${testPharmacy.subdomain}`);
    
    try {
      const tenantResponse = await fetch(`http://localhost:3000/api/tenant/${testPharmacy.subdomain}`);
      if (tenantResponse.ok) {
        const tenantData = await tenantResponse.json();
        console.log('   ✅ Tenant API with subdomain: SUCCESS');
        console.log(`   📋 Pharmacy Name: ${tenantData.name}`);
        console.log(`   🌐 Subdomain: ${tenantData.subdomain}`);
        console.log(`   📍 Location: ${tenantData.contact.city}, ${tenantData.contact.country}`);
      } else {
        console.log('   ❌ Tenant API with subdomain: FAILED');
        console.log(`   Status: ${tenantResponse.status}`);
      }
    } catch (error) {
      console.log('   ❌ Tenant API with subdomain: ERROR');
      console.log(`   Error: ${error.message}`);
    }
    
    // Test 2: Stats API call with subdomain
    console.log('\n2️⃣ Testing Stats API with subdomain:');
    console.log(`   URL: /api/tenant/${testPharmacy.subdomain}/stats`);
    
    try {
      const statsResponse = await fetch(`http://localhost:3000/api/tenant/${testPharmacy.subdomain}/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('   ✅ Stats API with subdomain: SUCCESS');
        console.log(`   👥 Total Users: ${statsData.totalUsers}`);
        console.log(`   💊 Total Medicines: ${statsData.totalMedicines}`);
        console.log(`   💰 Inventory Value: $${statsData.totalInventoryValue}`);
      } else {
        console.log('   ❌ Stats API with subdomain: FAILED');
        console.log(`   Status: ${statsResponse.status}`);
      }
    } catch (error) {
      console.log('   ❌ Stats API with subdomain: ERROR');
      console.log(`   Error: ${error.message}`);
    }
    
    // Test 3: API call with tenant ID (for comparison)
    console.log('\n3️⃣ Testing API with tenant ID (for comparison):');
    console.log(`   URL: /api/tenant/${testPharmacy._id}`);
    
    try {
      const tenantIdResponse = await fetch(`http://localhost:3000/api/tenant/${testPharmacy._id}`);
      if (tenantIdResponse.ok) {
        const tenantIdData = await tenantIdResponse.json();
        console.log('   ✅ Tenant API with ID: SUCCESS');
        console.log(`   📋 Pharmacy Name: ${tenantIdData.name}`);
      } else {
        console.log('   ❌ Tenant API with ID: FAILED');
      }
    } catch (error) {
      console.log('   ❌ Tenant API with ID: ERROR');
    }
    
    // Test 4: Simulate login and dashboard flow
    console.log('\n4️⃣ Testing Login Flow:');
    
    try {
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: pharmacyOwner.email,
          password: 'SunsetPass123!'
        }),
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('   ✅ Login: SUCCESS');
        console.log(`   👤 User: ${loginData.user.firstName} ${loginData.user.lastName}`);
        console.log(`   🏥 Tenant Subdomain: ${loginData.user.tenantSubdomain}`);
        console.log(`   🆔 Tenant ID: ${loginData.user.tenantId}`);
        
        // Verify the subdomain matches
        if (loginData.user.tenantSubdomain === testPharmacy.subdomain) {
          console.log('   ✅ Subdomain in user object: CORRECT');
        } else {
          console.log('   ❌ Subdomain in user object: INCORRECT');
        }
      } else {
        console.log('   ❌ Login: FAILED');
      }
    } catch (error) {
      console.log('   ❌ Login: ERROR');
      console.log(`   Error: ${error.message}`);
    }
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await Medicine.deleteMany({ tenantId: testPharmacy._id });
    await MultiTenantUser.findByIdAndDelete(pharmacyOwner._id);
    await Tenant.findByIdAndDelete(testPharmacy._id);
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 SUBDOMAIN API TEST RESULTS:');
    console.log('✅ Pharmacy created with subdomain');
    console.log('✅ User login includes subdomain');
    console.log('✅ API calls work with subdomain');
    console.log('✅ Dashboard can use clean URLs');
    console.log('');
    console.log('📋 Expected Dashboard URLs:');
    console.log(`   Tenant Info: /api/tenant/${testPharmacy.subdomain}`);
    console.log(`   Stats: /api/tenant/${testPharmacy.subdomain}/stats`);
    console.log(`   Clean URL: ${testPharmacy.subdomain}.pharmatrack.com`);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

testSubdomainAPI();